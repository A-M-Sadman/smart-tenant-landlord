# Project Signoff Document

This document serves as the formal signoff for the Smart Tenant-Landlord Management Platform, confirming that all deliverables have been completed, tested, and are ready for final submission and evaluation.

---

## Project Information

| Field | Details |
|-------|---------|
| Project Name | Smart Tenant-Landlord Management Platform |
| Course | CSE309 — Web Application & Internet |
| Institution | Independent University, Bangladesh (IUB) |
| Group | S5-05 |
| Submission Date | August 2026 |

---

## Team

| Member | ID | Role | Ownership |
|--------|----|------|-----------|
| Sadman Abdullah | M1 | Full-Stack Developer | Admin side, Landlord side — Auth, Property, Unit, Assignment, Agreement, Payment, Dashboard, Analytics |
| Zainab Reem | M2 | Full-Stack Developer | Tenant side, Staff side — Tenant Profile, Maintenance, Complaint, Notification, Tenant Dashboard, Staff Dashboard |

---

## Deliverables Checklist

### Code

| Deliverable | Status |
|-------------|--------|
| Backend — FastAPI with all 10 modules implemented | ✅ Complete |
| Frontend — React + Vite + TypeScript for all 4 roles | ✅ Complete |
| Database schema — PostgreSQL via Supabase with Alembic migrations | ✅ Complete |
| Authentication — JWT access + refresh token flow | ✅ Complete |
| File storage — Cloudinary integration for profile and property images | ✅ Complete |
| Role-based access control across all endpoints | ✅ Complete |
| Mobile responsive layout for all dashboards | ✅ Complete |

### Deployment

| Deliverable | Status |
|-------------|--------|
| Backend deployed on Render | ✅ Live |
| Frontend deployed on Vercel | ✅ Live |
| Database hosted on Supabase | ✅ Live |
| All Alembic migrations applied to production | ✅ Complete |
| Environment secrets documented in `.github/SECRETS.md` | ✅ Complete |

### Documentation

| Document | ID | Status |
|----------|----|--------|
| Project Overview | 01 | ✅ |
| Problem Statement | 02 | ✅ |
| Stakeholder Analysis | 03 | ✅ |
| Information Gathering | 04 | ✅ |
| Interviews | 05 | ✅ |
| Surveys | 06 | ✅ |
| Feasibility Analysis | 07 | ✅ |
| Product Requirements Document | 08 | ✅ |
| User Personas | 09 | ✅ |
| User Journey | 10 | ✅ |
| User Stories | 11 | ✅ |
| Acceptance Criteria | 12 | ✅ |
| Functional Requirements | 13 | ✅ |
| Non-Functional Requirements | 14 | ✅ |
| Use Cases | 15 | ✅ |
| Data Flow Diagram | 16 | ✅ |
| Software Requirements Specification | 17 | ✅ |
| Entity Relationship Diagram | 18 | ✅ |
| System Design | 19 | ✅ |
| Technical Design Document | 20 | ✅ |
| Database Design | 21 | ✅ |
| API Design | 22 | ✅ |
| Test Plan | 23 | ✅ |
| Test Cases | 24 | ✅ |
| Traceability Matrix | 25 | ✅ |
| Risk Analysis | 26 | ✅ |
| Project Roadmap | 27 | ✅ |
| Signoff Document | 28 | ✅ |
| Infrastructure Architecture | 29 | ✅ |

---

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend | https://smart-tenant-landlord.vercel.app |
| Backend API | https://smart-tenant-landlord.onrender.com |
| API Documentation | https://smart-tenant-landlord.onrender.com/docs |
| GitHub Repository | https://github.com/A-M-Sadman/smart-tenant-landlord |

---

## Test Coverage Summary

| Module | Test Cases | Result |
|--------|-----------|--------|
| Authentication | TC-001 to TC-008 | ✅ All passed |
| Property & Unit | TC-009 to TC-016 | ✅ All passed |
| Tenant Assignment | TC-017 to TC-024 | ✅ All passed |
| Maintenance | TC-025 to TC-033 | ✅ All passed |
| Rental Agreement | TC-034 to TC-044 | ✅ All passed |
| Rent Tracking | TC-045 to TC-051 | ✅ All passed |
| Complaint Management | TC-052 to TC-058 | ✅ All passed |
| Notifications | TC-059 to TC-065 | ✅ All passed |
| Dashboards & Analytics | TC-066 to TC-071 | ✅ All passed |
| Admin Panel | TC-072 to TC-076 | ✅ All passed |
| Profile Management | TC-077 to TC-080 | ✅ All passed |
| **Total** | **80** | **✅ 80/80 passed** |

---

## Known Limitations

| Limitation | Description |
|------------|-------------|
| Email notifications | Preference toggles are stored but no SMTP email delivery is configured |
| Payment gateway | Rent payments are recorded manually — no real payment processing |
| Audit logging | `AuditLog` model exists in schema but is not actively populated |
| Pagination | API responses return all records without pagination — acceptable for course scope |
| Repository pattern | Services access the database directly without a repository abstraction layer |

---

## Sign Off

By signing below, the team confirms that all deliverables listed in this document have been completed to the best of their ability within the given timeline and course constraints.

| Member | Signature | Date |
|--------|-----------|------|
| Sadman Abdullah (M1) | Sadman Abdullah | August 2026 |
| Zainab Reem (M2) | Zainab Reem | August 2026 |