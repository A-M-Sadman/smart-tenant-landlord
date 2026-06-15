# Smart Tenant-Landlord Management Platform - Acceptance Criteria

## Feature-Level Gherkin Acceptance Criteria

### AC-01 Registration (FR-001..FR-003)
- **Given** a new user on the registration page, **when** valid name, email, password, and role are submitted, **then** the account is created and a success response is returned.
- **Given** an email that already exists, **when** a user attempts registration, **then** the system returns `409 CONFLICT` with an actionable error message.
- **Given** a password that does not meet policy requirements, **when** the user submits the form, **then** the system rejects the request with inline validation details.
- **Given** a role is not selected, **when** the user submits the form, **then** the system rejects the request indicating role is required.

### AC-02 Login and JWT Session (FR-004..FR-007)
- **Given** valid credentials, **when** a user logs in, **then** access and refresh tokens are issued and the user is redirected to their role-specific dashboard.
- **Given** invalid credentials, **when** login is attempted, **then** the system returns `401 UNAUTHORIZED` with a clear error message.
- **Given** an expired access token and a valid refresh token, **when** the refresh endpoint is called, **then** a new access token is issued without requiring re-login.
- **Given** a logged-in user, **when** they log out, **then** tokens are invalidated and the user is redirected to the login page.

### AC-03 Role-Based Access Control (FR-008)
- **Given** a tenant-authenticated request, **when** a landlord-only endpoint is called, **then** the system returns `403 FORBIDDEN`.
- **Given** an admin-authenticated session, **when** any platform resource is accessed, **then** full read and write access is granted.
- **Given** a maintenance staff session, **when** they attempt to access rent tracking endpoints, **then** the system returns `403 FORBIDDEN`.

### AC-04 Property and Unit Management (FR-012..FR-019)
- **Given** an authenticated landlord, **when** a property is created with name and address, **then** it is persisted and appears in the landlord's property list.
- **Given** an existing property, **when** the landlord edits its name or address, **then** the updated record is saved and reflected immediately.
- **Given** a property with no active tenants, **when** the landlord deletes it, **then** the property and its units are removed.
- **Given** a property, **when** a unit is added with floor, size, and monthly rent, **then** it appears under that property with status Vacant.
- **Given** a unit with an active tenant, **when** a landlord views the unit list, **then** the unit is shown as Occupied with the tenant's name.

### AC-05 Tenant Assignment (FR-020..FR-024)
- **Given** an authenticated landlord, **when** a tenant is assigned to a vacant unit, **then** the unit status changes to Occupied and the tenant receives an assignment notification.
- **Given** a unit that is already occupied, **when** the landlord attempts to assign another tenant, **then** the system returns a conflict error and rejects the assignment.
- **Given** a tenant assigned to a unit, **when** the landlord removes them, **then** the unit status returns to Vacant.
- **Given** an authenticated tenant, **when** they view their profile, **then** their assigned unit details are visible.

### AC-06 Rental Agreements (FR-025..FR-029)
- **Given** an authenticated landlord, **when** an agreement is created with tenant, unit, start date, end date, and rent amount, **then** the agreement is persisted and the tenant is notified.
- **Given** an authenticated tenant, **when** they navigate to the agreements section, **then** their active agreement is displayed with full terms.
- **Given** an agreement whose end date has passed, **when** the system evaluates its status, **then** the status is automatically set to Expired.
- **Given** a landlord, **when** they view agreement history, **then** all past and active agreements for their properties are listed with status.

### AC-07 Rent Tracking (FR-030..FR-034)
- **Given** an authenticated landlord, **when** a rent payment is logged for a tenant with amount and date, **then** the payment is recorded and reflected in the tenant's payment history.
- **Given** a tenant whose rent due date has passed without a logged payment, **when** the landlord views the rent dashboard, **then** that tenant is flagged as overdue.
- **Given** an authenticated tenant, **when** they view their payment history, **then** all logged payments with dates and amounts are listed.
- **Given** a rent due date is approaching, **when** the reminder schedule triggers, **then** an in-app notification is sent to the tenant.

### AC-08 Maintenance Management (FR-035..FR-041)
- **Given** an authenticated tenant, **when** a maintenance request is submitted with an issue description and type, **then** the request is created with status Open and the landlord is notified.
- **Given** an open maintenance request, **when** the landlord assigns it to a staff member, **then** the request status changes to Assigned and the staff member is notified.
- **Given** an authenticated maintenance staff member, **when** they view their assigned requests, **then** only requests assigned to them are listed.
- **Given** an assigned request, **when** the staff member updates the status to In Progress, **then** the landlord and tenant are notified of the status change.
- **Given** a request marked Resolved with a resolution note, **when** the tenant views the request, **then** the resolution note and resolved timestamp are visible.

### AC-09 Complaint Management (FR-042..FR-046)
- **Given** an authenticated tenant, **when** a complaint is filed with a description, **then** it is logged with status Open and the landlord is notified.
- **Given** an open complaint, **when** the landlord submits a response, **then** the complaint status changes to Responded and the tenant is notified.
- **Given** a complaint with a landlord response that the tenant deems insufficient, **when** the tenant escalates it, **then** the complaint is flagged for admin review.
- **Given** an escalated complaint, **when** the admin submits a resolution, **then** the complaint status changes to Resolved and all parties are notified.

### AC-10 Notifications (FR-047..FR-051)
- **Given** a triggering event occurs (rent due, maintenance status change, complaint response, tenant assignment), **when** the event is committed, **then** the relevant in-app notification is created for the target user within 5 seconds.
- **Given** a user has unread notifications, **when** they log in, **then** the notification count badge is visible on the dashboard.
- **Given** a user reads a notification, **when** they mark it as read, **then** it is removed from the unread count.

### AC-11 Dashboards and Analytics (FR-052..FR-058)
- **Given** an authenticated tenant, **when** the dashboard loads, **then** their agreement status, recent payment, and open maintenance requests are displayed.
- **Given** an authenticated landlord, **when** the dashboard loads, **then** occupancy rate, overdue rent count, open maintenance requests, and open complaints are displayed.
- **Given** an authenticated admin, **when** the dashboard loads, **then** total users, total properties, active agreements, and escalated complaints are displayed.
- **Given** an authenticated maintenance staff member, **when** the dashboard loads, **then** assigned requests grouped by status (Open, In Progress, Resolved) are displayed.
- **Given** a landlord views analytics, **when** the occupancy chart is rendered, **then** it reflects the current ratio of occupied to vacant units across all their properties.
- **Given** a landlord views analytics, **when** the rent collection chart is rendered, **then** it shows monthly payment totals for the current year.

## Coverage Note
All acceptance criteria are traceable to user stories and functional requirements. Full mapping is maintained in [25-traceability-matrix.md](25-traceability-matrix.md).
