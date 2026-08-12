# Deployment Secrets Setup

All secrets are stored in **Railway → Variables** (backend) and **Vercel → Environment Variables** (frontend).
> **Secrets are not committed to the repository.** Every value below must be added as an environment variable in the deployment platform, not hardcoded in any file.

---

## Complete Secrets List

| Secret | Platform | Required |
|--------|----------|----------|
| `DATABASE_URL` | Railway | ✅ |
| `SECRET_KEY` | Railway | ✅ |
| `ALGORITHM` | Railway | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Railway | ✅ |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Railway | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Railway | ✅ |
| `CLOUDINARY_API_KEY` | Railway | ✅ |
| `CLOUDINARY_API_SECRET` | Railway | ✅ |

---

## 1. Database URL — `DATABASE_URL`

PostgreSQL connection string pointing to the Supabase database.

**Where to get it:**

1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **Connect** (top right) → **Session pooler** tab
3. Copy the connection string and replace `[YOUR-PASSWORD]` with your actual database password

**Format:**
```
postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

> ⚠️ If your password contains special characters like `@`, URL-encode them as `%40`. In Railway's Variables tab you can paste the raw password without encoding.

---

## 2. JWT Secret Key — `SECRET_KEY`

Used to sign and verify JWT access tokens.

**Rules:**
- Must be at least 32 characters long
- Must be random and unpredictable — do NOT use a memorable word

**How to generate a strong value:**
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(48))"

# PowerShell
[System.Convert]::ToBase64String((1..48 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

---

## 3. Algorithm — `ALGORITHM`

JWT signing algorithm. Set this to:
```
HS256
```

---

## 4. Token Expiry — `ACCESS_TOKEN_EXPIRE_MINUTES` + `REFRESH_TOKEN_EXPIRE_DAYS`

Controls how long tokens stay valid.

**Recommended values:**
```
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## 5. Cloudinary Credentials — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Used for image uploads (property images, profile photos).

**Where to get them:**

1. Go to [cloudinary.com](https://cloudinary.com) → sign in
2. Go to **Dashboard**
3. Copy **Cloud name**, **API Key**, and **API Secret**

**Team Cloudinary accounts:**

| Member | Cloud Name | Used For |
|--------|------------|----------|
| Sadman (M1) | `dmk7xvsvx` | Landlord/Admin/Staff profile photos, property images |
| Zainab (M2) | `dnkcrvssk` | Tenant profile photos |

> The upload preset used by both accounts is `smart_tenant_upload`.

---

## How to Add Secrets to Railway

1. Go to [railway.app](https://railway.app) → open your project
2. Click on your service → **Variables** tab
3. Click **New Variable**
4. Enter the **Name** and **Value**
5. Click **Add** — Railway will automatically redeploy

---

## How to Add Secrets to Vercel

1. Go to [vercel.com](https://vercel.com) → open your project
2. **Settings** → **Environment Variables**
3. Enter **Key** and **Value**
4. Select **Production** environment
5. Click **Save** — redeploy for changes to take effect

---

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend | https://smart-tenant-landlord.vercel.app |
| Backend | https://smart-tenant-landlord-production.up.railway.app |
| API Docs | https://smart-tenant-landlord-production.up.railway.app/docs |
| Database | Supabase — Northeast Asia (Seoul) |

---

## Verify Backend is Running

```bash
curl https://smart-tenant-landlord-production.up.railway.app/
# Expected: {"message":"Smart Tenant-Landlord API is running."}
```

---

## Security Notes

- The `.env` file is in `.gitignore` and must never be committed to the repository
- Rotate your `SECRET_KEY` and database password if they are ever exposed
- Cloudinary API secrets should be regenerated if compromised — go to Cloudinary Dashboard → Settings → Access Keys
- Supabase database password can be reset at Supabase → Settings → Database → Reset password