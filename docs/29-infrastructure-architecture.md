# Infrastructure Architecture

This document describes the production infrastructure architecture for the Smart Tenant-Landlord Management Platform, including deployment topology, data flow, service responsibilities, and environment configuration.

---

## Architecture Overview

```mermaid
graph TD
    User["👤 User (Browser / Mobile)"]
    Vercel["🌐 Vercel\nFrontend CDN\nReact + Vite + TypeScript"]
    Render["⚙️ Render\nBackend Server\nFastAPI + Uvicorn"]
    Supabase["🗄️ Supabase\nPostgreSQL Database\nap-northeast-2 Seoul"]
    Cloudinary1["☁️ Cloudinary\nSadman's Account\ndmk7xvsvx\nProperty + Staff Images"]
    Cloudinary2["☁️ Cloudinary\nZainab's Account\ndnkcrvssk\nTenant Profile Photos"]

    User -->|HTTPS| Vercel
    Vercel -->|Rewrite /api/*| Render
    Render -->|SQLAlchemy + psycopg2| Supabase
    Render -->|REST API| Cloudinary1
    Render -->|REST API| Cloudinary2
```

---

## Services

### Frontend — Vercel

| Property | Value |
|----------|-------|
| Platform | Vercel (Hobby tier) |
| Framework | Vite + React + TypeScript |
| Region | Washington D.C. (iad1) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `frontend` |
| Auto-deploy | On push to `main` |
| URL | https://smart-tenant-landlord.vercel.app |

**Routing:** Vercel serves the React SPA from `index.html` for all non-API routes (SPA fallback rewrite). API calls matching `/api/*` are rewritten and proxied to the Render backend.

**`vercel.json` rewrites:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://smart-tenant-landlord.onrender.com/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Backend — Render

| Property | Value |
|----------|-------|
| Platform | Render (Free web service) |
| Framework | FastAPI + Uvicorn |
| Python version | 3.11 (pinned via `runtime.txt`) |
| Region | As selected at service creation |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Root directory | `backend` |
| Auto-deploy | On push to `main` |
| URL | https://smart-tenant-landlord.onrender.com |
| API Docs | https://smart-tenant-landlord.onrender.com/docs |

**Environment Variables (Render):**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase session pooler connection string |
| `SECRET_KEY` | 48-byte random JWT signing key |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `CLOUDINARY_CLOUD_NAME` | `dmk7xvsvx` (Sadman's cloud) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | `8000` (set explicitly) |

---

### Database — Supabase

| Property | Value |
|----------|-------|
| Platform | Supabase (Free tier) |
| Engine | PostgreSQL |
| Region | ap-northeast-2 (Seoul) |
| Compute | Nano (t3a.nano) |
| Connection method | Session pooler (port 5432) |
| Migrations | Managed by Alembic |

**Connection string format:**
```
postgresql://postgres.[project-ref]:[password]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

**Database tables (16 total):**

| Table | Description |
|-------|-------------|
| `users` | All platform users across 4 roles |
| `refresh_tokens` | JWT refresh token storage |
| `properties` | Landlord properties |
| `units` | Units under properties |
| `tenant_profiles` | Extended tenant profile data |
| `tenant_assignments` | Tenant-to-unit assignments |
| `rental_agreements` | Rental agreement contracts |
| `rent_payments` | Payment records |
| `maintenance_requests` | Tenant maintenance submissions |
| `maintenance_assignments` | Staff-to-request assignments |
| `complaints` | Tenant complaints |
| `complaint_responses` | Landlord responses to complaints |
| `notifications` | In-app notifications |
| `notification_preferences` | Per-user notification settings |
| `audit_logs` | System audit trail (schema only) |
| `alembic_version` | Alembic migration tracking |

---

### File Storage — Cloudinary

| Account | Cloud Name | Used For | Upload Preset |
|---------|-----------|----------|---------------|
| Sadman (M1) | `dmk7xvsvx` | Property images, landlord/admin/staff profile photos | `smart_tenant_upload` |
| Zainab (M2) | `dnkcrvssk` | Tenant profile photos | `smart_tenant_upload` |

All uploads use **unsigned upload presets** — the browser uploads directly to Cloudinary without routing through the backend. The returned `secure_url` is then saved to the database.

---

## Request Flow

### Authenticated API Request (Production)

```
Browser
  │
  ├─ GET /landlord/dashboard (React Router — served from index.html by Vercel)
  │
  └─ GET /api/v1/dashboard/landlord
       │
       ├─ Vercel Edge: matches /api/* rewrite rule
       │
       ├─ Proxied to Render: GET /api/v1/dashboard/landlord
       │   Authorization: Bearer <JWT>
       │
       ├─ FastAPI: validates JWT → extracts user_id and role
       │
       ├─ Service layer: queries Supabase via SQLAlchemy
       │
       └─ Response: JSON → Render → Vercel → Browser
```

### Image Upload Flow

```
Browser selects file
  │
  └─ POST https://api.cloudinary.com/v1_1/{cloud}/image/upload
       (direct browser → Cloudinary, no backend involved)
       │
       └─ Returns secure_url
            │
            └─ PATCH /api/v1/tenant/profile  (or /api/v1/auth/users/me)
                 body: { profile_photo_url: secure_url }
                 │
                 └─ Saved to Supabase
```

---

## CI/CD Pipeline

```mermaid
graph LR
    Dev["💻 Local Development"]
    GitHub["📦 GitHub\nmain branch"]
    Vercel["🌐 Vercel\nAuto-deploy frontend"]
    Render["⚙️ Render\nAuto-deploy backend"]

    Dev -->|git push| GitHub
    GitHub -->|webhook| Vercel
    GitHub -->|webhook| Render
```

Both Vercel and Render are connected to the GitHub repository and automatically redeploy when a push is made to `main`. Typical deployment time is 30–60 seconds for the frontend and 1–2 minutes for the backend.

---

## Security Architecture

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT (HS256) with 30-minute access tokens and 7-day refresh tokens |
| Password hashing | bcrypt via passlib (bcrypt==4.0.1) |
| CORS | Restricted to `localhost:5173` and `smart-tenant-landlord.vercel.app` |
| Secrets | Stored exclusively in Render and Vercel environment variables |
| Database | Supabase managed PostgreSQL with password authentication |
| HTTPS | Enforced by Vercel (frontend) and Render (backend) |
| `.env` | Excluded from repository via `.gitignore` |