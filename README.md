# Smart Tenant-Landlord Management Platform — Documentation Repository

This repository section contains a complete end-to-end Requirements Engineering and **Software Development Life Cycle (SDLC)** documentation set for the **Smart Tenant-Landlord Management Platform**, developed as a CSE309 course project.

## Purpose

1. Provide production-grade project documentation with full traceability.
2. Demonstrate the complete SDLC flow from discovery to release readiness.
3. Serve as a structured artifact for academic evaluation and future reference.

## Team

| Member | Role | Ownership |
|--------|------|-----------|
| A-M-Sadman (M1) | Full-Stack Developer | Auth, Property, Unit, Tenant Assignment, Rental Agreement, Rent Tracking, Landlord Dashboard, Admin Panel, Analytics |
| Zainab-reem (M2) | Full-Stack Developer | Tenant Profile, Maintenance Management, Complaint Management, Notifications, Tenant Dashboard, Staff Dashboard |

## Software Development Life Cycle (SDLC) Flow

```
flowchart TD
  A[Problem Discovery] --> B[Requirement Elicitation]
  B --> C[Product Requirements Document]
  C --> D[User Stories]
  D --> E[Requirements]
  E --> F[Software Requirements Specification]
  F --> G[System Design]
  G --> H[Database Design]
  H --> I[API Design]
  I --> J[Implementation]
  J --> K[Testing]
  K --> L[Release]
```

## Technology Baseline

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | Python FastAPI + SQLAlchemy + Alembic |
| Database | PostgreSQL |
| Authentication | JWT (python-jose + passlib) |
| File Storage | Cloudinary |
| Deployment | Railway + Supabase (planned) |

## System Roles

| Role | Description |
|------|-------------|
| Admin | Platform-wide oversight, user and property management |
| Landlord | Manages properties, units, tenants, agreements, payments, maintenance, complaints |
| Tenant | Views rental info, submits maintenance requests and complaints, pays rent |
| Maintenance Staff | Views and updates assigned maintenance work |

## Core Modules

| # | Module | Owner |
|---|--------|-------|
| 01 | Authentication & Authorization | Both |
| 02 | Property Management | M1 (Sadman) |
| 03 | Unit Management | M1 (Sadman) |
| 04 | Tenant Profile | M2 (Zainab) |
| 05 | Tenant Assignment | M1 (Sadman) |
| 06 | Maintenance Management | M2 (Zainab) |
| 07 | Rental Agreement Creation | M1 (Sadman) |
| 08 | Agreement Viewing & Acceptance | M2 (Zainab) |
| 09 | Rent Tracking | M1 (Sadman) |
| 10 | Complaint Management | M2 (Zainab) |
| 11 | Landlord Dashboard & Admin Panel | M1 (Sadman) |
| 12 | Tenant & Staff Dashboard | M2 (Zainab) |
| 13 | Analytics | M1 (Sadman) |
| 14 | Notifications | M2 (Zainab) |
| 15 | Integration Testing | Both |
| 16 | Final Documentation & Delivery | Both |

## Repository Navigation

| # | Document | Focus Area |
|---|----------|------------|
| 01 | [Project Overview](./01-project-overview.md) | Executive context, scope, value |
| 02 | [Problem Statement](./02-problem-statement.md) | Current vs future state |
| 03 | [Stakeholder Analysis](./03-stakeholder-analysis.md) | Influence-interest, RACI |
| 04 | [Information Gathering](./04-information-gathering.md) | Elicitation methodology |
| 05 | [Interviews](./05-interviews.md) | Qualitative findings |
| 06 | [Surveys](./06-surveys.md) | Quantitative insights |
| 07 | [Feasibility Analysis](./07-feasibility-analysis.md) | Technical/economic/operational feasibility |
| 08 | [Product Requirements Document (PRD)](./08-prd.md) | Product requirements baseline |
| 09 | [User Personas](./09-user-personas.md) | Persona definitions |
| 10 | [User Journey](./10-user-journey.md) | End-to-end user flow |
| 11 | [User Stories](./11-user-stories.md) | Epics and stories |
| 12 | [Acceptance Criteria](./12-acceptance-criteria.md) | Gherkin-style criteria |
| 13 | [Functional Requirements](./13-functional-requirements.md) | FR-001..FR-080 |
| 14 | [Non-Functional Requirements](./14-non-functional-requirements.md) | NFR-001..NFR-030 |
| 15 | [Use Cases](./15-use-cases.md) | UC-01..UC-15 |
| 16 | [Data Flow Diagram (DFD)](./16-dfd.md) | Context, Level 0, Level 1 |
| 17 | [Software Requirements Specification (SRS)](./17-srs.md) | IEEE-style SRS |
| 18 | [Entity Relationship Diagram (ERD)](./18-erd.md) | Entity relationships |
| 19 | [System Design](./19-system-design.md) | Architecture and deployment |
| 20 | [Technical Design Document (TDD)](./20-tdd.md) | Technical implementation design |
| 21 | [Database Design](./21-database-design.md) | Schema, constraints, indexes |
| 22 | [API Design](./22-api-design.md) | REST API contracts |
| 23 | [Test Plan](./23-test-plan.md) | QA strategy |
| 24 | [Test Cases](./24-test-cases.md) | TC-001..TC-100 |
| 25 | [Traceability Matrix](./25-traceability-matrix.md) | US → FR/NFR → API → TC |
| 26 | [Risk Analysis](./26-risk-analysis.md) | Risk register and mitigations |
| 27 | [Project Roadmap](./27-project-roadmap.md) | 8-week sprint timeline |
| 28 | [Signoff Document](./28-signoff-document.md) | Formal approval template |
| 29 | [Infrastructure Architecture](./29-infrastructure-architecture.md) | Deployment and infrastructure |

## Traceability Promise

- Every user story maps to functional requirements.
- Every requirement maps to verification tests.
- All requirements are represented in the traceability matrix.
- Every API endpoint is documented with request/response contracts.
