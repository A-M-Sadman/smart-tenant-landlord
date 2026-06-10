# Smart Tenant-Landlord Management Platform - Project Overview

## Executive Summary
Smart Tenant-Landlord Management Platform is a web-based property management system for landlords, tenants, maintenance staff, and administrators to manage the full rental lifecycle in one place. The platform combines property and unit management, rental agreements, rent tracking, maintenance requests, and complaint resolution to reduce manual coordination overhead and improve transparency between all parties.

## Project Background
Property management in Bangladesh and similar markets relies heavily on informal communication channels — phone calls for rent reminders, paper agreements, and in-person visits for maintenance. This creates poor accountability, delayed resolution, and no audit trail. A centralized digital platform addresses these gaps by formalizing every interaction.

## Business Problem
Current landlord-tenant workflows break down because:
1. Rental agreements are paper-based with no versioning or digital access.
2. Rent payments are tracked manually with no automated reminders.
3. Maintenance requests are communicated informally with no status tracking.
4. Complaints have no structured escalation path.
5. Admins have no centralized visibility across all properties and users.

## Proposed Solution
Deliver a centralized property management platform with:
- Role-based access for Tenant, Landlord, Maintenance Staff, and Admin
- Property and unit management with tenant assignment
- Digital rental agreement creation and viewing
- Rent tracking with payment history and reminders
- Maintenance request lifecycle from submission to resolution
- Complaint management with admin oversight
- Dashboards with role-specific analytics and notifications
- JWT-secured Django REST Framework backend, React frontend, PostgreSQL persistence

## Project Scope
| In Scope | Description |
|---|---|
| Authentication | Register, login, JWT sessions, role-based access for all 4 roles |
| Property Management | Landlord creates and manages properties |
| Unit Management | Landlord manages individual units within properties |
| Tenant Management | Assign and remove tenants from units |
| Rental Agreements | Create, sign, and view agreements digitally |
| Rent Tracking | Log payments, view history, send reminders |
| Maintenance Management | Submit, assign, and resolve maintenance requests |
| Complaint Management | File and respond to complaints |
| Notifications | In-app notifications for key events across all roles |
| Dashboards & Analytics | Role-specific dashboards with key metrics |

## Stakeholders
| Stakeholder Group | Primary Interest |
|---|---|
| Tenants | Transparent agreements, rent history, maintenance tracking |
| Landlords | Property oversight, rent collection, complaint resolution |
| Maintenance Staff | Clear request assignments and resolution workflow |
| Admin | Full platform oversight, user management, escalation handling |
| University Instructor | End-to-end SDLC documentation, traceability, code quality |
| Engineering Team (M1, M2) | Modular build, clean API contracts, complete delivery |

## Business Value
| Value Driver | Expected Outcome |
|---|---|
| Digitized agreements | Legally traceable, accessible anytime |
| Automated rent tracking | Fewer missed payments, better landlord cash flow visibility |
| Structured maintenance flow | Faster resolution, accountable staff |
| Complaint escalation | Reduced disputes, documented resolution trail |
| Admin oversight | Centralized control, platform-wide accountability |

## Success Metrics
| Metric ID | Metric | Target |
|---|---|---|
| SM-01 | Rent payment reminder delivery success | >= 99% |
| SM-02 | Maintenance request resolution within SLA | >= 85% |
| SM-03 | Tenant onboarding (unit assignment to active) | <= 5 minutes |
| SM-04 | API response time (P95) | <= 500 ms |
| SM-05 | All 28 documentation artifacts completed | 100% |

## Assumptions
1. Users have reliable internet access and a modern browser.
2. Each unit is occupied by a single primary tenant.
3. Payments are logged manually (no payment gateway integration in this release).
4. Notifications are in-app; email delivery is optional.

## Constraints
| Constraint | Impact |
|---|---|
| Fixed 8-week semester timeline | Strict scope discipline required |
| 2-person team (M1 + M2) | Clean module boundary between Admin/Landlord and Tenant/Staff sides |
| Academic delivery requirements | Full SDLC documentation and GitHub project hygiene mandatory |

## Out Of Scope
1. Real money payment gateway integration.
2. Native mobile applications (iOS/Android).
3. Real-time chat between tenants and landlords.
4. Multi-language support.
5. PDF generation for lease documents.