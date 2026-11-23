# Test Cases

This document lists all manual test cases executed during the integration testing phase of the Smart Tenant-Landlord Management Platform. Each test case is identified with a unique ID, mapped to a module, and includes preconditions, steps, and expected results.

---

## Authentication

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-001 | Register new landlord | No existing account | POST `/auth/register` with role=landlord | 201 Created, user returned |
| TC-002 | Register new tenant | No existing account | POST `/auth/register` with role=tenant | 201 Created, user returned |
| TC-003 | Login with valid credentials | Account exists | POST `/auth/login` with correct email/password | 200 OK, access_token + refresh_token returned |
| TC-004 | Login with wrong password | Account exists | POST `/auth/login` with wrong password | 401 Unauthorized |
| TC-005 | Access protected route without token | — | GET `/properties` with no Authorization header | 401 Unauthorized |
| TC-006 | Access protected route with expired token | Token expired | GET `/properties` with old token | 401 Unauthorized |
| TC-007 | Refresh token | Valid refresh token exists | POST `/auth/refresh` with refresh_token | 200 OK, new access_token returned |
| TC-008 | Logout | Valid refresh token | POST `/auth/logout` | 204 No Content, token revoked |

---

## Property & Unit Management

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-009 | Create property | Landlord logged in | POST `/properties` with name, address, city, district | 201 Created |
| TC-010 | List own properties | Landlord has properties | GET `/properties` | Returns only landlord's properties |
| TC-011 | Tenant cannot create property | Tenant logged in | POST `/properties` | 403 Forbidden |
| TC-012 | Edit property | Landlord owns property | PATCH `/properties/{id}` | 200 OK, updated fields returned |
| TC-013 | Delete property | Landlord owns property | DELETE `/properties/{id}` | 204 No Content |
| TC-014 | Create unit under property | Landlord owns property | POST `/properties/{id}/units` | 201 Created |
| TC-015 | Edit unit | Landlord owns property | PATCH `/units/{id}` | 200 OK |
| TC-016 | Delete unit | Landlord owns property | DELETE `/units/{id}` | 204 No Content |

---

## Tenant Assignment

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-017 | Assign tenant to unit | Active tenant and vacant unit exist | POST `/assignments` | 201 Created, status=active |
| TC-018 | Assign to already occupied unit | Unit has active assignment | POST `/assignments` | 409 Conflict |
| TC-019 | Assign tenant already active elsewhere | Tenant has active assignment | POST `/assignments` | 409 Conflict |
| TC-020 | Assign non-tenant user | Target user has role=landlord | POST `/assignments` | 400 Bad Request |
| TC-021 | End assignment | Active assignment exists | POST `/assignments/{id}/end` | 200 OK, status=past |
| TC-022 | Search tenants by email | Tenant accounts exist | GET `/tenants/search?email=...` | Returns matching tenant users |
| TC-023 | Get unit active assignment | Unit has active assignment | GET `/units/{id}/assignment` | Returns assignment with tenant info |
| TC-024 | Tenant get own assignment | Tenant has active assignment | GET `/assignments/mine` | Returns active assignment with unit |

---

## Maintenance Management

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-025 | Tenant submit maintenance request | Tenant has active assignment | POST `/maintenance/requests` | 201 Created |
| TC-026 | Submit without active assignment | Tenant not assigned | POST `/maintenance/requests` | 403 Forbidden |
| TC-027 | Landlord view all requests | Landlord has properties with requests | GET `/maintenance/requests` | Returns only requests on own properties |
| TC-028 | Landlord update request status | Request exists on own property | PATCH `/maintenance/requests/{id}` | 200 OK, status updated |
| TC-029 | Landlord assign staff | Maintenance staff account exists | POST `/maintenance/requests/{id}/assign` | 200 OK, assignment created |
| TC-030 | Assign non-staff user | Target user is tenant | POST `/maintenance/requests/{id}/assign` | 400 Bad Request |
| TC-031 | Staff view own assignments | Staff has assignments | GET `/maintenance/assignments/my` | Returns staff's assignments only |
| TC-032 | Staff update assignment status | Staff has active assignment | PATCH `/maintenance/assignments/{id}` | 200 OK, status updated |
| TC-033 | Staff search by email | Staff accounts exist | GET `/maintenance/staff/search?email=` | Returns matching staff users |

---

## Rental Agreement

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-034 | Create agreement | Active assignment exists | POST `/agreements` | 201 Created, status=draft |
| TC-035 | Create duplicate agreement | Agreement already exists for assignment | POST `/agreements` | 409 Conflict |
| TC-036 | End date before start date | — | POST `/agreements` with invalid dates | 400 Bad Request |
| TC-037 | Edit draft agreement | Agreement in draft status | PATCH `/agreements/{id}` | 200 OK |
| TC-038 | Edit active agreement | Agreement is active | PATCH `/agreements/{id}` | 400 Bad Request |
| TC-039 | Activate agreement | Agreement in draft | POST `/agreements/{id}/activate` | 200 OK, status=active, signed_at set |
| TC-040 | Delete draft agreement | Agreement in draft | DELETE `/agreements/{id}` | 204 No Content |
| TC-041 | Delete active agreement | Agreement is active | DELETE `/agreements/{id}` | 400 Bad Request |
| TC-042 | Tenant view own agreements | Tenant has agreement | GET `/agreements/my` | Returns tenant's agreements |
| TC-043 | Tenant accept agreement | Agreement is active | POST `/agreements/{id}/accept` | 200 OK, tenant_accepted_at set |
| TC-044 | Accept already accepted agreement | Already accepted | POST `/agreements/{id}/accept` | 400 Bad Request |

---

## Rent Tracking

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-045 | Create payment record | Active agreement exists | POST `/payments` | 201 Created |
| TC-046 | Create payment for non-active agreement | Agreement is draft | POST `/payments` | 400 Bad Request |
| TC-047 | Mark payment as paid | Pending payment exists | PATCH `/payments/{id}` with status=paid | 200 OK, paid_date set to today |
| TC-048 | Tenant view own payments | Tenant has payments | GET `/payments/my` | Returns tenant's payments only |
| TC-049 | Tenant pay pending payment | Pending payment exists | POST `/payments/{id}/pay` | 200 OK, status=paid |
| TC-050 | Tenant pay already paid payment | Payment is paid | POST `/payments/{id}/pay` | 400 Bad Request |
| TC-051 | Delete payment record | Payment exists | DELETE `/payments/{id}` | 204 No Content |

---

## Complaint Management

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-052 | Tenant submit complaint | Tenant has active assignment | POST `/complaints` | 201 Created |
| TC-053 | Submit without assignment | Tenant not assigned | POST `/complaints` | 403 Forbidden |
| TC-054 | Landlord view all complaints | Complaints exist on own properties | GET `/complaints` | Returns only own property complaints |
| TC-055 | Landlord update complaint status | Complaint on own property | PATCH `/complaints/{id}` | 200 OK |
| TC-056 | Landlord respond to complaint | Complaint on own property | POST `/complaints/{id}/respond` | 200 OK, response added |
| TC-057 | Tenant delete open complaint | Complaint is open | DELETE `/complaints/{id}` | 204 No Content |
| TC-058 | Tenant delete non-open complaint | Complaint is under_review | DELETE `/complaints/{id}` | 400 Bad Request |

---

## Notifications

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-059 | Landlord send notification | Tenant account exists | POST `/notifications/send` | 201 Created, sender copy also created |
| TC-060 | Tenant view notifications | Notification sent to tenant | GET `/notifications` | Returns tenant's notifications |
| TC-061 | Mark single notification as read | Unread notification exists | PATCH `/notifications/{id}/read` | 200 OK, is_read=true |
| TC-062 | Mark all as read | Multiple unread notifications | PATCH `/notifications/read-all` | 200 OK, count returned |
| TC-063 | Delete notification | Notification exists | DELETE `/notifications/{id}` | 204 No Content |
| TC-064 | Get notification preferences | User logged in | GET `/notifications/preferences` | Returns or auto-creates preferences |
| TC-065 | Update notification preferences | Preferences exist | PATCH `/notifications/preferences` | 200 OK, toggles updated |

---

## Dashboards & Analytics

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-066 | Landlord dashboard stats | Landlord has properties, tenants, payments | GET `/dashboard/landlord` | Returns correct counts for all stats |
| TC-067 | Tenant dashboard stats | Tenant has assignment, agreement, payments | GET `/dashboard/tenant` | Returns unit info, payment count, etc. |
| TC-068 | Staff dashboard stats | Staff has assignments | GET `/dashboard/staff` | Returns assigned/in_progress/completed counts |
| TC-069 | Admin platform stats | Multiple users, properties exist | GET `/admin/stats` | Returns platform-wide totals |
| TC-070 | Analytics revenue data | Payments exist | GET `/analytics` | Returns 6 months of revenue data |
| TC-071 | Analytics occupancy | Units and assignments exist | GET `/analytics` | Returns correct occupancy rate |

---

## Admin Panel

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-072 | Admin list all users | Multiple users registered | GET `/admin/users` | Returns all users with roles |
| TC-073 | Admin deactivate user | Active non-admin user exists | PATCH `/admin/users/{id}/deactivate` | 200 OK, is_active=false |
| TC-074 | Admin activate user | Deactivated user exists | PATCH `/admin/users/{id}/activate` | 200 OK, is_active=true |
| TC-075 | Admin deactivate admin | Admin account exists | PATCH `/admin/users/{id}/deactivate` | 400 Bad Request |
| TC-076 | Admin view all properties | Properties exist | GET `/admin/properties` | Returns all properties with landlord info |

---

## Profile Management

| ID | Title | Precondition | Steps | Expected Result |
|----|-------|-------------|-------|----------------|
| TC-077 | View own profile | Any user logged in | GET `/auth/me` | Returns user info |
| TC-078 | Update name and phone | Any user logged in | PATCH `/auth/users/me` | 200 OK, updated fields returned |
| TC-079 | Tenant upload profile photo | Tenant logged in | PATCH `/tenant/profile` with profile_photo_url | 200 OK, URL saved |
| TC-080 | Non-tenant upload profile photo | Landlord/staff/admin logged in | PATCH `/auth/users/me` with profile_photo_url | 200 OK, URL saved |