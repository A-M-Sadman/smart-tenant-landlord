10-user-journey.md
# Smart Tenant-Landlord Management Platform - Functional Requirements

| FR ID | Description | Priority | Business Justification | Related User Story |
|---|---|---|---|---|
| FR-001 | System shall allow user registration with name, unique email, password, and role selection. | High | Enables role-aware onboarding for all four user types | US-001 |
| FR-002 | System shall enforce unique email constraint during account creation. | High | Prevents identity conflicts across user roles | US-001 |
| FR-003 | System shall enforce password policy (minimum length and complexity). | High | Reduces account compromise risk | US-001 |
| FR-004 | System shall authenticate users with email and password and issue JWT access token. | High | Enables secure session-based access | US-002 |
| FR-005 | System shall redirect authenticated users to their role-specific dashboard upon login. | High | Eliminates navigation confusion across four distinct roles | US-005 |
| FR-006 | System shall provide a refresh-token endpoint for renewing access tokens. | High | Maintains secure session continuity without re-login | US-003 |
| FR-007 | System shall revoke and blacklist refresh tokens on logout. | High | Prevents session misuse after sign-out | US-004 |
| FR-008 | System shall restrict access to protected API endpoints using JWT validation and role-based permission checks. | High | Enforces data isolation between roles | US-007 |
| FR-009 | System shall allow authenticated users to update their profile name and contact details. | Medium | Improves account maintainability | US-006 |
| FR-010 | System shall allow admin to activate and deactivate user accounts. | High | Enables platform governance and abuse control | US-007 |
| FR-011 | System shall allow admin to change user role assignments. | High | Supports user lifecycle management | US-007 |
| FR-012 | System shall allow an authenticated landlord to create a property with name, address, and description. | High | Core landlord onboarding — no platform value without properties | US-008 |
| FR-013 | System shall allow a landlord to edit property details (name, address, description). | High | Keeps property records accurate | US-009 |
| FR-014 | System shall allow a landlord to delete a property that has no active tenants or agreements. | Medium | Removes obsolete records without data integrity risk | US-010 |
| FR-015 | System shall display all properties owned by the authenticated landlord in a list view. | High | Provides consolidated portfolio visibility | US-011 |
| FR-016 | System shall allow a landlord to add a unit to a property with floor, size, and monthly rent amount. | High | Enables unit-level tenancy management | US-012 |
| FR-017 | System shall allow a landlord to edit unit details (floor, size, rent amount). | High | Keeps unit records accurate | US-013 |
| FR-018 | System shall allow a landlord to delete a unit that is not currently occupied. | Medium | Cleans up vacant or obsolete units | US-014 |
| FR-019 | System shall display unit occupancy status (Occupied / Vacant) and assigned tenant name for each unit. | High | Gives landlord real-time occupancy overview | US-015 |
| FR-020 | System shall allow a landlord to view all registered tenant accounts on the platform. | High | Prerequisite for tenant assignment workflow | US-016 |
| FR-021 | System shall allow a landlord to assign a tenant to a vacant unit, updating unit status to Occupied. | High | Formalizes tenancy relationship in the system | US-017 |
| FR-022 | System shall reject tenant assignment if the target unit is already occupied. | High | Prevents double-occupancy data conflict | US-017 |
| FR-023 | System shall allow a landlord to remove a tenant from a unit, updating unit status to Vacant. | High | Supports tenant move-out workflow | US-018 |
| FR-024 | System shall display the assigned unit details to the authenticated tenant in their profile view. | High | Gives tenants visibility into their own tenancy | US-019 |
| FR-025 | System shall send an in-app notification to a tenant when they are assigned to a unit. | Medium | Keeps tenant informed of landlord actions | US-020 |
| FR-026 | System shall allow a landlord to create a rental agreement linked to a tenant, unit, start date, end date, and monthly rent amount. | High | Digitizes the core legal tenancy document | US-021 |
| FR-027 | System shall display the active rental agreement to the authenticated tenant with full terms. | High | Removes tenant dependency on paper copies | US-022 |
| FR-028 | System shall display all agreements created by the authenticated landlord with status indicators. | High | Provides landlord with complete tenancy record | US-023 |
| FR-029 | System shall maintain agreement status as Active, Expired, or Terminated and auto-update to Expired when end date passes. | High | Ensures tenancy lifecycle accuracy without manual updates | US-024, US-025 |
| FR-030 | System shall allow a landlord to log a rent payment for a tenant with amount and payment date. | High | Creates formal payment record replacing informal confirmation | US-026 |
| FR-031 | System shall display full rent payment history to the authenticated tenant. | High | Provides tenant with proof of all past payments | US-027 |
| FR-032 | System shall display a rent payment status overview for all tenants to the authenticated landlord. | High | Enables landlord to monitor cash flow across all units | US-028 |
| FR-033 | System shall flag tenants as Overdue when rent due date has passed without a logged payment. | High | Automates overdue detection replacing manual follow-up | US-029 |
| FR-034 | System shall send an in-app rent due reminder notification to the tenant before the due date. | High | Reduces missed payments and landlord follow-up burden | US-030 |
| FR-035 | System shall allow an authenticated tenant to submit a maintenance request with issue description and issue type. | High | Formalizes repair request replacing informal channels | US-031 |
| FR-036 | System shall display all open maintenance requests for the authenticated landlord's properties. | High | Gives landlord consolidated view of pending repairs | US-032 |
| FR-037 | System shall allow a landlord to assign a maintenance request to a registered maintenance staff member. | High | Delegates responsibility formally with an audit trail | US-033 |
| FR-038 | System shall display all maintenance requests assigned to the authenticated maintenance staff member. | High | Gives staff a structured task queue | US-034 |
| FR-039 | System shall allow maintenance staff to update request status to In Progress or Resolved. | High | Provides real-time progress visibility to all parties | US-035 |
| FR-040 | System shall allow maintenance staff to add a resolution note when marking a request as Resolved. | High | Documents the fix for tenant and landlord records | US-036 |
| FR-041 | System shall display the current status, assigned staff, and timestamps of a maintenance request to the tenant who submitted it. | High | Removes tenant uncertainty about request progress | US-037 |
| FR-042 | System shall allow an authenticated tenant to file a complaint with a description against their unit or landlord. | High | Provides formal escalation path replacing verbal disputes | US-038 |
| FR-043 | System shall display all complaints filed against the authenticated landlord's properties. | High | Ensures landlord visibility into tenant grievances | US-039 |
| FR-044 | System shall allow a landlord to submit a written response to an open complaint. | High | Formalizes landlord reply and notifies tenant | US-040 |
| FR-045 | System shall allow a tenant to escalate a complaint to admin if the landlord response is insufficient. | High | Provides resolution path beyond landlord level | US-041 |
| FR-046 | System shall allow an admin to review and submit a resolution for escalated complaints, notifying all parties. | High | Closes dispute loop at the highest authority level | US-042 |
| FR-047 | System shall send an in-app notification to the tenant when rent is due. | High | Reduces missed payments through proactive alerting | US-043 |
| FR-048 | System shall send an in-app notification to the tenant when their maintenance request status changes. | High | Eliminates need for tenant to poll manually | US-044 |
| FR-049 | System shall send an in-app notification to the tenant when their complaint receives a response. | High | Confirms complaint was received and acted upon | US-045 |
| FR-050 | System shall send an in-app notification to maintenance staff when a new request is assigned to them. | High | Ensures immediate awareness of new task assignments | US-046 |
| FR-051 | System shall send an in-app notification to a tenant when assigned to a unit by a landlord. | Medium | Keeps tenant informed without manual communication | US-047 |
| FR-052 | System shall display a tenant dashboard showing active agreement status, recent rent payment, and open maintenance requests. | High | Gives tenant a single-screen tenancy summary | US-048 |
| FR-053 | System shall display a landlord dashboard showing occupancy rate, overdue rent count, open maintenance requests, and open complaints. | High | Enables landlord to manage all operations from one screen | US-049 |
| FR-054 | System shall display an admin dashboard showing total users, total properties, active agreements, and escalated complaints. | High | Provides platform-wide health monitoring for admin | US-050 |
| FR-055 | System shall display a maintenance staff dashboard showing assigned requests grouped by status (Open, In Progress, Resolved). | High | Gives staff a structured, prioritized work queue | US-051 |
| FR-056 | System shall display an occupancy rate chart showing occupied versus vacant units across the landlord's properties. | Medium | Enables landlord to spot and act on vacancy trends | US-052 |
| FR-057 | System shall display a monthly rent collection chart showing total payments logged per month for the current year. | Medium | Provides landlord with cash flow trend visibility | US-053 |
| FR-058 | System shall display a maintenance resolution rate metric showing the percentage of resolved versus total requests. | Medium | Enables admin to assess maintenance staff performance | US-054 |

## Requirement Notes
1. FR IDs are baseline-controlled and referenced consistently across use cases, API design, test cases, and the traceability matrix.
2. All High priority FRs constitute the MVP scope. Medium FRs follow in later phases per the roadmap.
3. FR-001 through FR-011 are shared between M1 and M2. FR-012 through FR-034 are owned by M1. FR-035 through FR-058 are owned by M2.

## SMART Quality Check for Functional Requirements
| SMART Element | Functional Requirement Quality Rule |
|---|---|
| Specific | Each FR states a clear system behavior with an explicit actor, action, and outcome. |
| Measurable | Each FR is testable through Gherkin acceptance criteria in [12-acceptance-criteria.md](12-acceptance-criteria.md). |
| Achievable | FR scope aligns with the approved tech stack and 8-week delivery timeline. |
| Relevant | Each FR links to at least one user story and a business justification rooted in the problem statement. |
| Timely | FR execution is phase-prioritized and milestone-planned in [27-project-roadmap.md](27-project-roadmap.md). |

## MoSCoW Mapping for Functional Requirements
| MoSCoW Category | Priority Mapping | FR Coverage |
|---|---|---|
| Must Have | High | FR-001..FR-012, FR-015..FR-016, FR-019..FR-024, FR-026..FR-036, FR-037..FR-055 |
| Should Have | Medium | FR-009, FR-013..FR-014, FR-017..FR-018, FR-025, FR-051, FR-056..FR-058 |
| Could Have | Low | Analytics drill-down, CSV export of payment history, PDF agreement view |
| Won't Have (this release) | Not in FR baseline | Real payment gateway, native mobile app, real-time chat, multi-language support |