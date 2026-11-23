# Test Plan
 
The Smart Tenant-Landlord Management Platform is a multi-role web application serving Admin, Landlord, Tenant, and Maintenance Staff users across ten functional modules. This test plan defines the quality assurance strategy, scope, approach, resources, and schedule for validating the platform before final delivery.
 
---
 
## Objectives
 
- Verify all functional requirements are correctly implemented across all four roles
- Validate that role-based access control prevents unauthorized operations
- Confirm the system behaves correctly under normal and edge-case conditions
- Ensure the deployed production environment on Vercel + Render + Supabase functions identically to the development environment
---
 
## Scope
 
### In Scope
 
| Module | Roles Covered |
|--------|--------------|
| Authentication & Authorization | All |
| Property & Unit Management | Landlord |
| Tenant Assignment | Landlord, Tenant |
| Maintenance Management | Tenant, Landlord, Maintenance Staff |
| Rental Agreement | Landlord, Tenant |
| Rent Tracking | Landlord, Tenant |
| Complaint Management | Tenant, Landlord |
| Notifications | All |
| Dashboard & Analytics | All |
| Admin Panel | Admin |
 
### Out of Scope
 
- Payment gateway integration (payments are recorded manually)
- Email delivery (email notification preferences are stored but no SMTP is configured)
- Load/performance testing
- Security penetration testing
---
 
## Test Levels
 
| Level | Description |
|-------|-------------|
| Unit Testing | Individual service functions validated during development |
| Integration Testing | API endpoints tested end-to-end via Swagger UI and deployed production URL |
| System Testing | Full user flows tested across all roles on the deployed platform |
| Acceptance Testing | Final walkthrough against course requirements and rubric |
 
---
 
## Test Types
 
| Type | Tool | Coverage |
|------|------|----------|
| Functional | Manual — Browser + Swagger UI | All modules, all roles |
| Role-based Access | Manual — multiple browser sessions | Auth enforcement on every endpoint |
| Regression | Manual after each bug fix | Affected modules re-tested |
| Responsive/UI | Manual — Chrome DevTools mobile emulation + physical device | All pages |
| API | Swagger UI (`/docs`) | All 60+ endpoints |
 
---
 
## Test Environment
 
| Component | Development | Production |
|-----------|-------------|------------|
| Frontend | `http://localhost:5173` (Vite) | https://smart-tenant-landlord.vercel.app |
| Backend | `http://localhost:8000` (uvicorn) | https://smart-tenant-landlord.onrender.com |
| Database | Local PostgreSQL | Supabase — ap-northeast-2 (Seoul) |
| API Docs | `http://localhost:8000/docs` | https://smart-tenant-landlord.onrender.com/docs |
 
---
 
## Test Data
 
| Data Type | Strategy |
|-----------|----------|
| Users | One account per role created manually |
| Properties | 2 properties, 4 units created via landlord dashboard |
| Assignments | 1 active tenant assignment per unit under test |
| Agreements | Draft and active agreements for assigned tenants |
| Payments | Mix of pending, paid, and overdue records |
| Maintenance requests | Open and resolved across multiple categories |
| Complaints | Open complaints with landlord responses |
| Notifications | Sent via landlord notification tool |
 
---
 
## Entry and Exit Criteria
 
### Entry Criteria
- All features for the relevant issue are merged to `main`
- Backend is deployed and healthy on Render
- Frontend is deployed and accessible on Vercel
- All Alembic migrations have been applied to Supabase
### Exit Criteria
- All test cases in the test case document have been executed
- All critical and high-priority defects are resolved
- No unresolved 500 errors on any endpoint
- All role-based access checks pass
---
 
## Roles and Responsibilities
 
| Role | Responsibility |
|------|---------------|
| Sadman Abdullah (M1) | Test cases for Auth, Property, Unit, Assignment, Agreement, Payment, Admin, Analytics |
| Zainab Reem (M2) | Test cases for Tenant Profile, Maintenance, Complaint, Notification, Tenant Dashboard, Staff Dashboard |
| Both | Integration testing, deployment validation, regression after bug fixes |
 
---
 
## Test Schedule
 
| Phase | Week | Activities |
|-------|------|-----------|
| Unit + API testing | W1–W7 | Each feature tested in Swagger immediately after implementation |
| Integration testing | W8 | Full end-to-end flows across all roles on production |
| Bug fixing | W8 | All defects found during integration testing resolved |
| Regression testing | W8 | Re-test affected modules after fixes |
| Final acceptance | W8 | Full walkthrough against rubric |
 
---
 
## Risk and Mitigation
 
| Risk | Mitigation |
|------|-----------|
| Production environment differs from dev | Environment variables validated in Render and Vercel |
| Supabase connection issues | Session pooler URL used; password encoded correctly |
| CORS blocking API calls | Vercel rewrite rules forward `/api/*` to Render |
| Token expiry during testing | Re-login between long test sessions |