09-user-personas.md
# Smart Tenant-Landlord Management Platform - User Personas

## Persona P1 - Rafiq (Tenant)
| Attribute | Details |
|---|---|
| Demographics | 23, university student renting a single room in a shared apartment |
| Goals | Access rental agreement anytime, confirm rent receipts, get maintenance fixed quickly |
| Motivations | Transparency, accountability from landlord, stress-free tenancy |
| Pain Points | No digital copy of agreement, no receipt after paying rent, ignored maintenance requests |
| Technology Usage | Mobile-first, browser-based, basic tech comfort |
| Typical Workflow | Login → check agreement → log rent payment → raise maintenance request → track status |

## Persona P2 - Karim (Landlord)
| Attribute | Details |
|---|---|
| Demographics | 45, mid-scale landlord managing 2 buildings with 12 units |
| Goals | Track rent collection across all tenants, manage maintenance efficiently, resolve complaints |
| Motivations | Reduced admin overhead, reliable cash flow, fewer disputes |
| Pain Points | Manual rent follow-ups via phone, no consolidated unit/tenant view, informal maintenance coordination |
| Technology Usage | Desktop browser, moderate tech comfort |
| Typical Workflow | Login → view dashboard → check overdue rent → assign maintenance request → review complaints |

## Persona P3 - Sadia (Maintenance Staff)
| Attribute | Details |
|---|---|
| Demographics | 31, full-time handyman assigned to a residential complex |
| Goals | Receive clear task assignments, update resolution status, avoid being blamed for delays |
| Motivations | Structured workflow, accountability trail, recognition for resolved work |
| Pain Points | Verbal assignments that get lost, no way to log progress, no timestamp protection |
| Technology Usage | Mobile browser, simple interface preferred |
| Typical Workflow | Login → view assigned requests → update status to In Progress → add resolution note → mark resolved |

## Persona P4 - Nadia (Admin)
| Attribute | Details |
|---|---|
| Demographics | 38, property management company administrator overseeing multiple landlords |
| Goals | Full visibility over all users, properties, and platform activity; handle escalated complaints |
| Motivations | Proactive oversight, platform trust, compliance |
| Pain Points | No unified dashboard, complaints escalated outside the system, no user management tools |
| Technology Usage | Desktop browser, data-focused usage |
| Typical Workflow | Login → admin dashboard → review escalated complaints → manage users → check analytics |

## Persona Coverage to Requirement Themes
| Theme | Personas | Related Requirements |
|---|---|---|
| Agreement transparency | P1, P2 | FR — Agreement creation, agreement viewing, agreement history |
| Rent tracking and reminders | P1, P2 | FR — Payment logging, overdue flagging, reminder notifications |
| Maintenance lifecycle | P1, P2, P3 | FR — Request submission, assignment, status update, resolution |
| Complaint escalation | P1, P2, P4 | FR — Complaint filing, landlord response, admin escalation |
| Role-specific dashboards | P2, P3, P4 | FR — Landlord dashboard, Tenant dashboard, Admin panel, Staff view |
| Security and access control | All | FR — JWT auth, role-based permissions, data isolation per role |