# Smart Tenant-Landlord Management Platform - User Stories

## Epic E1 - Authentication and Account Management
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-001 | E1 | Registration | As a user, I want to register with my name, email, password, and role so that I can access the platform with the right permissions. | High | FR-001, FR-002, FR-003 |
| US-002 | E1 | Login | As a user, I want to log in with my credentials so that I can access my role-specific dashboard securely. | High | FR-004, FR-005 |
| US-003 | E1 | Session Continuity | As a user, I want my JWT token to refresh automatically so that I stay logged in without interruption. | High | FR-006 |
| US-004 | E1 | Logout | As a user, I want to log out so that my account remains secure on shared devices. | High | FR-007 |
| US-005 | E1 | Role-Based Redirect | As a user, I want to be redirected to my role-specific dashboard after login so that I see only what is relevant to me. | High | FR-008 |
| US-006 | E1 | Profile Management | As a user, I want to update my profile information so that my account details stay current. | Medium | FR-009 |
| US-007 | E1 | Admin User Control | As an admin, I want to activate, deactivate, and change roles of users so that I can manage platform access. | High | FR-010, FR-011 |

## Epic E2 - Property and Unit Management
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-008 | E2 | Create Property | As a landlord, I want to create a property with a name, address, and description so that it appears in my portfolio. | High | FR-012 |
| US-009 | E2 | Edit Property | As a landlord, I want to edit my property details so that records stay accurate. | High | FR-013 |
| US-010 | E2 | Delete Property | As a landlord, I want to delete a property so that vacant or sold properties are removed from my list. | Medium | FR-014 |
| US-011 | E2 | View Property List | As a landlord, I want to view all my properties in one place so that I have a consolidated portfolio overview. | High | FR-015 |
| US-012 | E2 | Add Unit | As a landlord, I want to add units to a property so that individual rentable spaces are tracked. | High | FR-016 |
| US-013 | E2 | Edit Unit | As a landlord, I want to edit unit details so that floor, size, and rent information stays accurate. | High | FR-017 |
| US-014 | E2 | Delete Unit | As a landlord, I want to delete a unit so that obsolete or removed spaces are not tracked. | Medium | FR-018 |
| US-015 | E2 | View Unit Occupancy | As a landlord, I want to see which units are occupied and which are vacant so that I can plan new tenant assignments. | High | FR-019 |

## Epic E3 - Tenant Management and Assignment
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-016 | E3 | View Tenant List | As a landlord, I want to view all tenants on the platform so that I can manage assignments. | High | FR-020 |
| US-017 | E3 | Assign Tenant to Unit | As a landlord, I want to assign a tenant to a unit so that occupancy is formally recorded. | High | FR-021 |
| US-018 | E3 | Remove Tenant from Unit | As a landlord, I want to remove a tenant from a unit so that vacancies are reflected immediately. | High | FR-022 |
| US-019 | E3 | View Assigned Unit | As a tenant, I want to see which unit I am assigned to so that my tenancy details are clear. | High | FR-023 |
| US-020 | E3 | Tenant Assignment Notification | As a tenant, I want to be notified when I am assigned to a unit so that I am informed immediately. | Medium | FR-024 |

## Epic E4 - Rental Agreements
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-021 | E4 | Create Agreement | As a landlord, I want to create a rental agreement with terms, start date, end date, and rent amount so that the tenancy is formally documented. | High | FR-025 |
| US-022 | E4 | View Agreement (Tenant) | As a tenant, I want to view my rental agreement anytime so that I can reference the terms without contacting the landlord. | High | FR-026 |
| US-023 | E4 | View Agreement (Landlord) | As a landlord, I want to view all agreements I have created so that I have a complete tenancy record. | High | FR-027 |
| US-024 | E4 | Agreement History | As a landlord or tenant, I want to see the history of past agreements so that previous tenancy terms are accessible. | Medium | FR-028 |
| US-025 | E4 | Agreement Status | As a landlord, I want agreement status to reflect Active, Expired, or Terminated so that I know which tenancies are current. | High | FR-029 |

## Epic E5 - Rent Tracking
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-026 | E5 | Log Rent Payment | As a landlord, I want to log a rent payment for a tenant so that payment history is formally recorded. | High | FR-030 |
| US-027 | E5 | View Payment History | As a tenant, I want to view my rent payment history so that I have proof of all past payments. | High | FR-031 |
| US-028 | E5 | View Rent Dashboard | As a landlord, I want to see all tenants' payment status in one view so that I can identify who has and has not paid. | High | FR-032 |
| US-029 | E5 | Overdue Rent Flag | As a landlord, I want overdue rent to be flagged automatically so that I know who to follow up with. | High | FR-033 |
| US-030 | E5 | Rent Reminder Notification | As a tenant, I want to receive a reminder before rent is due so that I do not miss the payment date. | High | FR-034 |

## Epic E6 - Maintenance Management
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-031 | E6 | Submit Maintenance Request | As a tenant, I want to submit a maintenance request with an issue description and type so that it is formally logged. | High | FR-035 |
| US-032 | E6 | View Open Requests (Landlord) | As a landlord, I want to view all open maintenance requests so that I can assign them to staff. | High | FR-036 |
| US-033 | E6 | Assign Request to Staff | As a landlord, I want to assign a maintenance request to a staff member so that responsibility is delegated formally. | High | FR-037 |
| US-034 | E6 | View Assigned Requests (Staff) | As maintenance staff, I want to view all requests assigned to me so that I know what work is pending. | High | FR-038 |
| US-035 | E6 | Update Request Status | As maintenance staff, I want to update a request status to In Progress or Resolved so that the landlord and tenant are informed. | High | FR-039 |
| US-036 | E6 | Add Resolution Note | As maintenance staff, I want to add a resolution note when closing a request so that the fix is documented. | High | FR-040 |
| US-037 | E6 | Track Request Status (Tenant) | As a tenant, I want to track the status of my maintenance requests so that I know if my issue is being handled. | High | FR-041 |

## Epic E7 - Complaint Management
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-038 | E7 | File Complaint | As a tenant, I want to file a complaint with a description so that my grievance is formally recorded. | High | FR-042 |
| US-039 | E7 | View Complaints (Landlord) | As a landlord, I want to view all complaints filed against my properties so that I can respond promptly. | High | FR-043 |
| US-040 | E7 | Respond to Complaint | As a landlord, I want to respond to a complaint so that the tenant receives an official reply. | High | FR-044 |
| US-041 | E7 | Escalate Complaint to Admin | As a tenant, I want to escalate an unresolved complaint to the admin so that it receives higher-level attention. | High | FR-045 |
| US-042 | E7 | Resolve Complaint (Admin) | As an admin, I want to review and resolve escalated complaints so that platform disputes are formally closed. | High | FR-046 |

## Epic E8 - Notifications
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-043 | E8 | Rent Due Notification | As a tenant, I want an in-app notification when rent is due so that I am reminded in advance. | High | FR-047 |
| US-044 | E8 | Maintenance Status Notification | As a tenant, I want a notification when my maintenance request status changes so that I stay informed without checking manually. | High | FR-048 |
| US-045 | E8 | Complaint Response Notification | As a tenant, I want a notification when my complaint receives a response so that I know it was seen. | High | FR-049 |
| US-046 | E8 | Assignment Notification (Staff) | As maintenance staff, I want a notification when a new request is assigned to me so that I can act immediately. | High | FR-050 |
| US-047 | E8 | Tenant Assignment Notification | As a tenant, I want a notification when I am assigned to a unit so that I know the landlord has onboarded me. | Medium | FR-051 |

## Epic E9 - Dashboards and Analytics
| US ID | Epic | Feature | Story | Priority | Mapped FR |
|---|---|---|---|---|---|
| US-048 | E9 | Tenant Dashboard | As a tenant, I want a dashboard showing my agreement status, recent payments, and open requests so that I have a quick overview of my tenancy. | High | FR-052 |
| US-049 | E9 | Landlord Dashboard | As a landlord, I want a dashboard showing unit occupancy, rent payment status, open maintenance, and complaints so that I can manage everything from one screen. | High | FR-053 |
| US-050 | E9 | Admin Dashboard | As an admin, I want a dashboard showing total users, properties, active agreements, and escalated complaints so that I can monitor platform health. | High | FR-054 |
| US-051 | E9 | Maintenance Staff Dashboard | As maintenance staff, I want a dashboard showing my assigned requests by status so that I can prioritize my day. | High | FR-055 |
| US-052 | E9 | Analytics — Occupancy Rate | As a landlord, I want to see the occupancy rate across my properties so that I can identify vacant units quickly. | Medium | FR-056 |
| US-053 | E9 | Analytics — Rent Collection Rate | As a landlord, I want to see the rent collection rate per month so that I can track cash flow trends. | Medium | FR-057 |
| US-054 | E9 | Analytics — Maintenance Resolution Rate | As an admin, I want to see the maintenance resolution rate so that I can assess staff performance. | Medium | FR-058 |

## Coverage Note
All 54 user stories are mapped to functional requirements. Full end-to-end traceability from user story to test case is maintained in [25-traceability-matrix.md](25-traceability-matrix.md).
