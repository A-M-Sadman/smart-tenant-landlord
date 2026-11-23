# Traceability Matrix

This document traces each user story through functional requirements, API endpoints, and test cases for the Smart Tenant-Landlord Management Platform. It ensures complete coverage — every requirement is implemented and every implementation is tested.

---

## Matrix

| User Story | Functional Requirement | API Endpoint | Test Cases |
|------------|----------------------|--------------|-----------|
| As a user, I want to register an account so I can access the platform | FR-01 User registration with role selection | POST `/api/v1/auth/register` | TC-001, TC-002 |
| As a user, I want to log in so I can access my dashboard | FR-02 JWT-based authentication | POST `/api/v1/auth/login` | TC-003, TC-004, TC-005 |
| As a user, I want my session to persist so I don't get logged out frequently | FR-03 Refresh token mechanism | POST `/api/v1/auth/refresh` | TC-006, TC-007 |
| As a user, I want to log out securely | FR-04 Token revocation on logout | POST `/api/v1/auth/logout` | TC-008 |
| As a user, I want to view and edit my profile | FR-05 Profile management for all roles | GET/PATCH `/api/v1/auth/me` | TC-077, TC-078 |
| As a tenant, I want to upload a profile photo | FR-06 Tenant profile photo via Cloudinary | PATCH `/api/v1/tenant/profile` | TC-079 |
| As a landlord, I want to add my properties | FR-07 Property creation and management | POST/GET/PATCH/DELETE `/api/v1/properties` | TC-009, TC-010, TC-012, TC-013 |
| As a landlord, I want to add units to my properties | FR-08 Unit management under properties | POST/PATCH/DELETE `/api/v1/properties/{id}/units` | TC-014, TC-015, TC-016 |
| As a landlord, I want tenants to be unable to create properties | FR-09 Role-based access control | POST `/api/v1/properties` | TC-011 |
| As a landlord, I want to assign tenants to my units | FR-10 Tenant assignment to units | POST `/api/v1/assignments` | TC-017, TC-018, TC-019, TC-020 |
| As a landlord, I want to end a tenant assignment | FR-11 Assignment lifecycle management | POST `/api/v1/assignments/{id}/end` | TC-021 |
| As a landlord, I want to search for tenants by email | FR-12 Tenant email search | GET `/api/v1/tenants/search` | TC-022 |
| As a tenant, I want to know my current unit assignment | FR-13 Tenant self-assignment lookup | GET `/api/v1/assignments/mine` | TC-024 |
| As a tenant, I want to submit maintenance requests | FR-14 Maintenance request submission | POST `/api/v1/maintenance/requests` | TC-025, TC-026 |
| As a landlord, I want to view and manage maintenance requests | FR-15 Landlord maintenance management | GET/PATCH `/api/v1/maintenance/requests` | TC-027, TC-028 |
| As a landlord, I want to assign maintenance staff to requests | FR-16 Staff assignment to maintenance | POST `/api/v1/maintenance/requests/{id}/assign` | TC-029, TC-030 |
| As a maintenance staff, I want to view my assigned work | FR-17 Staff assignment view | GET `/api/v1/maintenance/assignments/my` | TC-031 |
| As a maintenance staff, I want to update my work status | FR-18 Staff work status update | PATCH `/api/v1/maintenance/assignments/{id}` | TC-032 |
| As a landlord, I want to create rental agreements | FR-19 Agreement creation and lifecycle | POST/GET/PATCH/DELETE `/api/v1/agreements` | TC-034, TC-035, TC-036, TC-037, TC-040 |
| As a landlord, I want to activate agreements | FR-20 Agreement activation with signature | POST `/api/v1/agreements/{id}/activate` | TC-039, TC-041 |
| As a tenant, I want to view and accept my agreement | FR-21 Tenant agreement view and acceptance | GET `/api/v1/agreements/my`, POST `/api/v1/agreements/{id}/accept` | TC-042, TC-043, TC-044 |
| As a landlord, I want to record rent payments | FR-22 Payment record management | POST/GET/PATCH/DELETE `/api/v1/payments` | TC-045, TC-046, TC-047, TC-051 |
| As a tenant, I want to view my payment history | FR-23 Tenant payment history | GET `/api/v1/payments/my` | TC-048 |
| As a tenant, I want to pay my rent through the app | FR-24 Tenant payment submission | POST `/api/v1/payments/{id}/pay` | TC-049, TC-050 |
| As a tenant, I want to submit complaints | FR-25 Complaint submission | POST `/api/v1/complaints` | TC-052, TC-053 |
| As a landlord, I want to respond to complaints | FR-26 Complaint management and response | GET/PATCH `/api/v1/complaints`, POST `/api/v1/complaints/{id}/respond` | TC-054, TC-055, TC-056 |
| As a tenant, I want to delete my open complaints | FR-27 Tenant complaint deletion | DELETE `/api/v1/complaints/{id}` | TC-057, TC-058 |
| As a landlord, I want to send notifications to tenants | FR-28 Notification sending | POST `/api/v1/notifications/send` | TC-059 |
| As a user, I want to manage my notification preferences | FR-29 Notification preference management | GET/PATCH `/api/v1/notifications/preferences` | TC-064, TC-065 |
| As a user, I want to view, read, and delete notifications | FR-30 Notification management | GET/PATCH/DELETE `/api/v1/notifications` | TC-060, TC-061, TC-062, TC-063 |
| As a landlord, I want a dashboard overview of my properties | FR-31 Landlord dashboard aggregation | GET `/api/v1/dashboard/landlord` | TC-066 |
| As a tenant, I want a dashboard showing my rental status | FR-32 Tenant dashboard | GET `/api/v1/dashboard/tenant` | TC-067 |
| As a maintenance staff, I want a dashboard of my workload | FR-33 Staff dashboard | GET `/api/v1/dashboard/staff` | TC-068 |
| As a landlord, I want to see revenue and occupancy analytics | FR-34 Analytics charts | GET `/api/v1/analytics` | TC-070, TC-071 |
| As an admin, I want to view platform-wide statistics | FR-35 Admin platform stats | GET `/api/v1/admin/stats` | TC-069 |
| As an admin, I want to manage all users | FR-36 Admin user management | GET/PATCH `/api/v1/admin/users` | TC-072, TC-073, TC-074, TC-075 |
| As an admin, I want to view all properties | FR-37 Admin property oversight | GET `/api/v1/admin/properties` | TC-076 |

---

## Coverage Summary

| Module | User Stories | FRs | Endpoints | Test Cases |
|--------|-------------|-----|-----------|-----------|
| Authentication | 4 | FR-01 to FR-04 | 4 | TC-001 to TC-008 |
| Profile Management | 3 | FR-05 to FR-06 | 3 | TC-077 to TC-080 |
| Property & Unit | 3 | FR-07 to FR-09 | 8 | TC-009 to TC-016 |
| Tenant Assignment | 4 | FR-10 to FR-13 | 7 | TC-017 to TC-024 |
| Maintenance | 5 | FR-14 to FR-18 | 8 | TC-025 to TC-033 |
| Rental Agreement | 3 | FR-19 to FR-21 | 7 | TC-034 to TC-044 |
| Rent Tracking | 3 | FR-22 to FR-24 | 7 | TC-045 to TC-051 |
| Complaint | 3 | FR-25 to FR-27 | 6 | TC-052 to TC-058 |
| Notifications | 3 | FR-28 to FR-30 | 7 | TC-059 to TC-065 |
| Dashboards & Analytics | 4 | FR-31 to FR-34 | 4 | TC-066 to TC-071 |
| Admin Panel | 2 | FR-35 to FR-37 | 3 | TC-072 to TC-076 |
| **Total** | **37** | **37** | **64** | **80** |