10-user-journey.md
# Smart Tenant-Landlord Management Platform - Technical Design Document (TDD)

## Technical Stack
| Layer | Technology | Version |
|---|---|---|
| Frontend | React.js + Vite + TypeScript | React 18+, Vite 5+, TypeScript 5+ |
| Backend | Python + FastAPI | Python 3.11+, FastAPI 0.110+ |
| ORM | SQLAlchemy + Alembic | SQLAlchemy 2.x, Alembic 1.x |
| Data Validation | Pydantic | v2.x |
| Database | PostgreSQL | 15+ |
| Authentication | JWT via python-jose + passlib (bcrypt) | python-jose 3.x, passlib 1.x |
| HTTP Client (Frontend) | Axios | 1.x |
| State Management (Frontend) | React Context API + useState/useEffect | Built-in |
| Package Management | pip + venv (backend), npm (frontend) | Latest |
| Development Server | uvicorn --reload (backend), vite dev (frontend) | — |
| Production Server (target) | Uvicorn + Nginx | — |
| Config Management | python-dotenv | 1.x |

---

## Backend Design by Layer

### 1. Entry Point and App Structure
```
backend/
├── main.py                  # FastAPI app instantiation, router registration, CORS config
├── .env                     # Environment variables (never committed)
├── requirements.txt
├── alembic/                 # Alembic migration environment
│   └── versions/
├── app/
│   ├── core/
│   │   ├── config.py        # Settings loaded from .env via pydantic-settings
│   │   ├── security.py      # JWT creation, decoding, password hashing
│   │   └── dependencies.py  # get_current_user, require_role dependency factory
│   ├── models/              # SQLAlchemy ORM models (shared across all routers)
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── assignment.py
│   │   ├── agreement.py
│   │   ├── payment.py
│   │   ├── maintenance.py
│   │   ├── complaint.py
│   │   └── notification.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── assignment.py
│   │   ├── agreement.py
│   │   ├── payment.py
│   │   ├── maintenance.py
│   │   ├── complaint.py
│   │   └── notification.py
│   ├── routers/             # FastAPI routers per domain
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── properties.py
│   │   ├── units.py
│   │   ├── assignments.py
│   │   ├── agreements.py
│   │   ├── payments.py
│   │   ├── maintenance.py
│   │   ├── complaints.py
│   │   ├── notifications.py
│   │   └── dashboard.py
│   ├── services/            # Business logic layer called by routers
│   │   ├── auth_service.py
│   │   ├── property_service.py
│   │   ├── agreement_service.py
│   │   ├── rent_service.py
│   │   ├── maintenance_service.py
│   │   ├── complaint_service.py
│   │   └── notification_service.py
│   └── db/
│       ├── base.py          # SQLAlchemy Base declarative
│       └── session.py       # get_db dependency — yields DB session
```

### 2. Router Layer
FastAPI `APIRouter` per domain, registered in `main.py`:
```python
app.include_router(auth_router,         prefix="/api/auth",          tags=["Auth"])
app.include_router(user_router,         prefix="/api/users",         tags=["Users"])
app.include_router(property_router,     prefix="/api/properties",    tags=["Properties"])
app.include_router(unit_router,         prefix="/api/units",         tags=["Units"])
app.include_router(assignment_router,   prefix="/api/assignments",   tags=["Assignments"])
app.include_router(agreement_router,    prefix="/api/agreements",    tags=["Agreements"])
app.include_router(payment_router,      prefix="/api/payments",      tags=["Payments"])
app.include_router(maintenance_router,  prefix="/api/maintenance",   tags=["Maintenance"])
app.include_router(complaint_router,    prefix="/api/complaints",    tags=["Complaints"])
app.include_router(notification_router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(dashboard_router,    prefix="/api/dashboard",     tags=["Dashboard"])
```

### 3. Dependency Injection for Auth and Role Enforcement
All protected routes use FastAPI's `Depends()` for authentication and role checks:

```python
# core/dependencies.py

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_jwt(token)           # raises 401 on invalid/expired
    user = db.get(User, payload["sub"])   # raises 401 if not found
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    return user

def require_role(*roles: str):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
```

**Usage per router:**
| Dependency | Applied To |
|---|---|
| `require_role("landlord")` | Property, Unit, Assignment, Agreement (create), Rent (log), Maintenance (assign) |
| `require_role("tenant")` | Agreement (view), Rent (view), Maintenance (submit), Complaint (file/escalate) |
| `require_role("maintenance_staff")` | Maintenance (status update, resolve) |
| `require_role("admin")` | User management, Complaint (admin resolve), Admin dashboard |
| `require_role("landlord", "admin")` | Complaint (view and respond) |
| `get_current_user` only | Profile update, notifications, tenant dashboard |

### 4. Pydantic Schema Layer
Separate `Request` and `Response` Pydantic schemas per resource:

```python
# schemas/maintenance.py

class MaintenanceRequestCreate(BaseModel):
    issue_type: str
    description: str

class MaintenanceRequestResponse(BaseModel):
    id: int
    issue_type: str
    description: str
    status: str
    assigned_staff_id: int | None
    resolution_note: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

- All `Response` schemas use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility.
- Computed fields (e.g., agreement `status` derived from `end_date`) are implemented as `@computed_field` or `@property` on the ORM model and exposed via schema.

### 5. SQLAlchemy Model Layer
All ORM models inherit from a shared `Base` in `db/base.py`:

```python
# models/maintenance.py

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id              = Column(BigInteger, primary_key=True, index=True)
    tenant_id       = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    unit_id         = Column(BigInteger, ForeignKey("units.id"), nullable=False)
    assigned_staff_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    issue_type      = Column(String, nullable=False)
    description     = Column(Text, nullable=False)
    status          = Column(String, default="open", nullable=False)
    resolution_note = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())
```

Key model implementation rules:
- `User.role` is a `String` column constrained to `tenant`, `landlord`, `maintenance_staff`, `admin`.
- `TenantAssignment.removed_at` is `nullable=True` — `None` means currently active.
- `RentalAgreement` has no `PUT` endpoint — only status transition endpoints (`/expire`, `/terminate`).
- All FK columns use `BigInteger` to match PK type and support scale.

### 6. Authentication Layer
```python
# core/security.py

SECRET_KEY  = settings.SECRET_KEY          # from .env
ALGORITHM   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = 15
REFRESH_TOKEN_EXPIRE_DAYS    = 7

def create_access_token(data: dict) -> str:
    expires = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

- `pwd_context` uses `passlib.context.CryptContext(schemes=["bcrypt"])`.
- Refresh tokens stored in the database (`refresh_tokens` table) and deleted on logout.
- Token blacklisting on logout: delete refresh token row; access token expiry (15 min) makes server-side blacklisting unnecessary for MVP.

### 7. Notification Dispatch
Notifications are created synchronously inside service functions after domain writes:

```
Domain Event                          → Notification Recipient
────────────────────────────────────────────────────────────────
TenantAssignment created              → Tenant
RentalAgreement created               → Tenant
RentPayment due date approaching      → Tenant (via scheduled script)
MaintenanceRequest submitted          → Landlord
MaintenanceRequest assigned           → Maintenance Staff
MaintenanceRequest status changed     → Tenant
Complaint filed                       → Landlord
Complaint responded                   → Tenant
Complaint escalated                   → Admin
Complaint resolved                    → Tenant + Landlord
```

`notification_service.dispatch(db, recipient_id, event_type, message)` is called at the end of each relevant service function.

### 8. Error Handling
FastAPI exception handlers registered in `main.py`:

```python
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"error": "VALIDATION_ERROR", "detail": exc.errors()})
```

Standard error response payload:
```json
{
  "error": "UNIT_ALREADY_OCCUPIED",
  "message": "This unit already has an active tenant assignment."
}
```

| Condition | HTTP Status |
|---|---|
| Pydantic validation failure | `400 BAD REQUEST` |
| Invalid or expired JWT | `401 UNAUTHORIZED` |
| Role not permitted | `403 FORBIDDEN` |
| Resource not found | `404 NOT FOUND` |
| Duplicate or conflict | `409 CONFLICT` |

### 9. Database Session Management
```python
# db/session.py

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

All routers receive a `db: Session = Depends(get_db)` argument. No raw SQL — all queries via SQLAlchemy ORM.

### 10. Scalability Strategy
1. Stateless JWT supports multiple Uvicorn workers behind Nginx without shared session state.
2. Separate routers per domain enforce clean module boundaries independently deployable.
3. Alembic manages all schema changes — no manual database alterations in any environment.
4. Rent due reminder is a standalone Python script (`scripts/send_rent_reminders.py`) scheduled via cron — no async queue required for MVP.
5. FastAPI's async route support allows non-blocking I/O if notification delivery is upgraded to a task queue (e.g., Celery) in a future release.

---

## Frontend Design

### Project Structure
```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Router setup, role-based route guards
│   ├── api/
│   │   ├── axiosInstance.ts  # Axios with interceptors for JWT attach + refresh
│   │   └── endpoints.ts      # Typed API call functions per resource
│   ├── context/
│   │   └── AuthContext.tsx   # JWT tokens + decoded user role in React Context
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces mirroring Pydantic response schemas
│   ├── pages/
│   │   ├── auth/             # Login, Register
│   │   ├── landlord/         # Properties, Units, Agreements, Rent, Maintenance, Complaints
│   │   ├── tenant/           # Agreement, Payments, Maintenance, Complaints
│   │   ├── staff/            # Assigned Requests
│   │   ├── admin/            # Users, Escalated Complaints
│   │   └── shared/           # Dashboard, Notifications, Profile
│   └── components/
│       ├── ProtectedRoute.tsx
│       ├── RoleGuard.tsx
│       └── ...shared UI components
```

### Route Structure and Role Guards
| Route | Guard |
|---|---|
| `/login`, `/register` | Public |
| `/dashboard` | Any authenticated role — redirects to role-specific view |
| `/landlord/*` | `require_role("landlord")` |
| `/tenant/*` | `require_role("tenant")` |
| `/staff/*` | `require_role("maintenance_staff")` |
| `/admin/*` | `require_role("admin")` |
| `/notifications`, `/profile` | Any authenticated role |

### Axios Interceptor Pattern
```typescript
// api/axiosInstance.ts

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const newToken = await refreshAccessToken();
      err.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(err.config);
    }
    return Promise.reject(err);
  }
);
```

### TypeScript Type Safety
All API response shapes are typed in `src/types/index.ts` to mirror Pydantic schemas:
```typescript
export interface MaintenanceRequest {
  id: number;
  issue_type: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "resolved";
  assigned_staff_id: number | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}
```

### Key Frontend Patterns
| Pattern | Applied To |
|---|---|
| `ProtectedRoute` component | All role-gated routes in `App.tsx` |
| TypeScript strict mode | All files — no implicit `any` |
| Optimistic UI | Maintenance status updates, notification mark-as-read |
| Inline form validation | All create/edit forms — error display within 500 ms |
| Role-conditional rendering | Dashboard widgets, navigation bar, action buttons |
| Pagination | Property list, tenant list, rent payment history |
| Auto-refresh on 401 | Axios response interceptor |

---

## Design-to-Requirement Mapping
| Design Area | Requirement IDs |
|---|---|
| Auth and role dependency module | FR-001..FR-011, NFR-012..NFR-018 |
| Property and unit routers | FR-012..FR-019, NFR-001, NFR-011 |
| Tenant assignment router | FR-020..FR-025, NFR-007 |
| Rental agreement router | FR-026..FR-029, NFR-029 |
| Rent tracking router | FR-030..FR-034, NFR-004 |
| Maintenance router | FR-035..FR-041, NFR-004, NFR-008 |
| Complaint router | FR-042..FR-046 |
| Notification module | FR-047..FR-051, NFR-004, NFR-008 |
| Dashboard router | FR-052..FR-058, NFR-001, NFR-003 |
| React + Vite + TypeScript SPA | NFR-019..NFR-021 |
| Python logging + FastAPI middleware | NFR-017, NFR-030 |
| Stateless JWT + Uvicorn workers | NFR-010, NFR-011, NFR-026, NFR-027 |