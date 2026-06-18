05-interviews.md
# Smart Tenant-Landlord Management Platform - Interview Report

## Interview Framework
- Format: semi-structured, 30-40 minutes per participant
- Focus: property management workflows, coordination pain points, unmet digital needs
- Artifact linkage: findings mapped to IF/FR/NFR IDs from information gathering

## Persona 1 - Tenant
### Background
A third-year university student renting a shared apartment, paying rent monthly and occasionally dealing with maintenance issues.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you access your rental agreement? | I have a paper copy from move-in, not sure where it is now | No durable digital access | FR — Agreement viewing for tenants | Digital storage is non-negotiable |
| How do you confirm your rent was received? | Landlord texts me when he checks | No formal receipt or record | FR — Rent payment logging, payment history | Tenants need their own payment trail |
| What happens when you have a maintenance issue? | I text the landlord and wait | No tracking, no SLA | FR — Maintenance request submission and status | Visibility into request status reduces anxiety |
| Have you ever had an unresolved complaint? | Yes, landlord just stopped responding | No escalation path | FR — Complaint filing, admin escalation | Escalation to admin is critical for trust |

## Persona 2 - Landlord
### Background
A mid-scale landlord managing two residential buildings with 12 units, relying on spreadsheets and phone calls for daily operations.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you track rent payments across all tenants? | Spreadsheet updated manually each month | Error-prone, no reminders | FR — Rent tracking, automated reminders | Automated logging replaces fragile manual records |
| How do you manage unit vacancies? | I remember who is where, sometimes I forget | No centralized unit view | FR — Property and unit management dashboard | Landlords need a live unit occupancy view |
| How do you handle maintenance requests? | Tenants call me, I call the plumber | No formal assignment system | FR — Maintenance assignment to staff | Landlord should be able to delegate and track |
| What would save you the most time? | Knowing who paid and who didn't without calling | Payment follow-up overhead | FR — Rent status overview, overdue flagging | Overdue rent visibility is highest priority feature |

## Persona 3 - Maintenance Staff
### Background
A full-time handyman assigned to a residential complex, handling plumbing, electrical, and general repairs.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you receive work assignments? | Landlord calls or messages me | No formal channel, easy to miss | FR — Maintenance request assignment, staff notification | Formal assignment with notification is essential |
| How do you update the landlord on progress? | I call back when done | No interim status updates | FR — Status update workflow (In Progress, Resolved) | Status visibility reduces landlord follow-up calls |
| What information do you need when assigned? | What the issue is and which unit | Vague verbal descriptions | FR — Request detail view with unit and issue description | Structured request details improve first-visit resolution |
| Do you ever get blamed for delays you didn't cause? | Yes, when the request was late to reach me | No timestamp trail | FR — Request creation and assignment timestamps | Audit trail protects staff accountability |

## Persona 4 - Admin
### Background
A property management company administrator overseeing multiple landlords, their properties, and platform-level user disputes.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you currently oversee all landlords and tenants? | I don't, each landlord reports to me separately | No unified view | FR — Admin dashboard with user and property overview | Centralized oversight is the admin's core need |
| How do you handle escalated complaints? | Tenant contacts me directly outside the system | No formal escalation path | FR — Complaint escalation to admin, admin resolution | Structured escalation prevents informal workarounds |
| What user management actions do you need? | Add/remove users, change roles, deactivate accounts | No admin control panel | FR — Admin user management | Full CRUD over users is table stakes for admin |
| What metrics do you track? | Occupancy rate, overdue rent, open complaints | No dashboard | FR — Admin analytics with key platform metrics | Metrics drive proactive admin decisions |

## Consolidated Pain Points
1. No digital access to rental agreements for either party.
2. Rent payment tracking is manual, error-prone, and unlogged.
3. Maintenance requests are communicated informally with no status visibility.
4. Complaint escalation has no structured path beyond direct contact.
5. Admins have no centralized view or control panel.

## Requirements Extracted (Top 12)
FR — Agreement creation and viewing, Rent tracking and reminders, Maintenance submission and assignment, Maintenance status updates, Complaint filing and escalation, Admin user management, Admin dashboard and analytics, Property and unit management, Tenant assignment, Notification delivery, Role-based access control, Payment history logging.

## Interview Insight Summary
All four user groups share a common root problem: workflows that depend on informal communication channels create accountability gaps. A structured, role-aware platform that formalizes every interaction — from agreement signing to complaint resolution — addresses the pain across all personas simultaneously.