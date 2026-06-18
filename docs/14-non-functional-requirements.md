10-user-journey.md
# Smart Tenant-Landlord Management Platform - Non-Functional Requirements

| NFR ID | Category | Requirement (Measurable Target) | Related FR |
|---|---|---|---|
| NFR-001 | Performance | P95 API response time for all read endpoints (property list, rent history, dashboard) shall be <= 500 ms under normal load. | FR-015, FR-031, FR-052..FR-055 |
| NFR-002 | Performance | P95 API response time for all write endpoints (create agreement, log payment, submit request) shall be <= 700 ms under normal load. | FR-026, FR-030, FR-035 |
| NFR-003 | Performance | Dashboard page initial load shall complete within <= 2 seconds on a standard broadband connection. | FR-052..FR-055 |
| NFR-004 | Performance | Notification delivery after a triggering event shall occur within <= 5 seconds. | FR-047..FR-051 |
| NFR-005 | Availability | Monthly service availability shall be >= 99.5% during the academic project lifecycle. | All FRs |
| NFR-006 | Availability | Planned maintenance windows shall not exceed 2 hours per week during development. | All FRs |
| NFR-007 | Reliability | All database writes shall be acknowledged before returning a success response to the client. | FR-026, FR-030, FR-035, FR-042 |
| NFR-008 | Reliability | Failed notification dispatch jobs shall be retried automatically up to 3 times with exponential backoff before failing silently. | FR-047..FR-051 |
| NFR-009 | Reliability | Agreement status auto-expiry shall execute within 24 hours of the agreement end date passing. | FR-029 |
| NFR-010 | Scalability | System architecture shall support horizontal scaling of the Django application layer without shared session state (stateless JWT). | FR-004, FR-006 |
| NFR-011 | Scalability | PostgreSQL schema design shall support >= 1,000 properties, 10,000 units, and 50,000 rent records without schema changes. | FR-012, FR-016, FR-030 |
| NFR-012 | Security | All API endpoints except registration and login shall require a valid JWT access token. | FR-004..FR-008 |
| NFR-013 | Security | JWT access tokens shall expire in <= 15 minutes; refresh tokens shall expire in <= 7 days. | FR-006, FR-007 |
| NFR-014 | Security | All user passwords shall be hashed using bcrypt or argon2; no plaintext password shall be stored or logged. | FR-001, FR-003 |
| NFR-015 | Security | All data in transit shall be encrypted using TLS 1.2 or higher. | All FRs |
| NFR-016 | Security | Role-based permission checks shall be applied at the API view layer on every protected endpoint; client-side role enforcement alone is insufficient. | FR-008, FR-010, FR-011 |
| NFR-017 | Security | Authentication failures and unauthorized access attempts shall be logged with request metadata for audit purposes. | FR-004, FR-008 |
| NFR-018 | Security | Tenant data shall be isolated at the query layer — a tenant shall never receive another tenant's agreement, payment, or maintenance records. | FR-027, FR-031, FR-041 |
| NFR-019 | Usability | A new tenant shall be able to complete registration, view their agreement, and submit a maintenance request within <= 5 minutes in usability testing. | FR-001, FR-027, FR-035 |
| NFR-020 | Usability | All forms shall display inline validation errors within 500 ms of submission failure. | FR-001, FR-026, FR-035 |
| NFR-021 | Usability | All UI components shall be responsive and usable on screens >= 375 px wide (mobile-first). | FR-052..FR-055 |
| NFR-022 | Maintainability | Backend modules shall maintain unit test coverage >= 70% for all serializers, views, and permission classes. | All FRs |
| NFR-023 | Maintainability | All API endpoints shall be documented with request/response schema in [22-api-design.md](22-api-design.md). | All FRs |
| NFR-024 | Maintainability | M1 and M2 module boundaries shall be enforced via separate Django apps with no direct cross-app model imports. | FR-012..FR-058 |
| NFR-025 | Maintainability | All environment-specific configuration (database credentials, secret keys, JWT settings) shall be stored in environment variables, not hardcoded. | FR-004..FR-008 |
| NFR-026 | Portability | The application shall run consistently in a local development environment using a documented setup procedure (README). | All FRs |
| NFR-027 | Portability | The PostgreSQL schema shall be fully managed through Django migrations; no manual schema changes in production. | All FRs |
| NFR-028 | Compliance | User accounts deactivated by admin shall have all session tokens invalidated immediately. | FR-010 |
| NFR-029 | Compliance | Rental agreement records shall be immutable once created — updates are not permitted, only status transitions. | FR-026, FR-029 |
| NFR-030 | Observability | Django application shall log request method, path, status code, and response time for all API calls to assist debugging and performance review. | All FRs |

## NFR Verification Approach
| Category | Verification Method |
|---|---|
| Performance | Manual load testing with realistic data volumes in Week 8 integration testing |
| Availability | Uptime monitoring during development; documented downtime incidents |
| Reliability | Database rollback tests; notification retry log verification |
| Scalability | Code review for stateless design; DB query analysis with EXPLAIN |
| Security | Auth abuse test cases in [24-test-cases.md](24-test-cases.md); manual role-bypass attempt testing |
| Usability | Peer usability walkthrough in Week 7; mobile responsiveness check in Chrome DevTools |
| Maintainability | Coverage report via pytest-cov; API doc completeness review |
| Portability | Fresh-environment setup test from README in Week 8 |
| Compliance | Agreement immutability verified via API test; token invalidation test on deactivation |
| Observability | Log output review during integration testing |