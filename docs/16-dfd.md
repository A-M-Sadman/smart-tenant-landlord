# Smart Tenant-Landlord Management Platform - Data Flow Diagrams (DFD)

## Context Diagram
```mermaid
flowchart LR
  T[Tenant]
  L[Landlord]
  S[Maintenance Staff]
  A[Admin]
  SYS[Smart Tenant-Landlord Platform]
  DB[(PostgreSQL)]
  NS[Notification Service]

  T -->|Registration, Login, Requests, Complaints, Rent View| SYS
  L -->|Login, Property/Unit/Agreement/Rent/Maintenance Management| SYS
  S -->|Login, Request Status Updates| SYS
  A -->|Login, User Management, Complaint Resolution| SYS

  SYS -->|Dashboards, Agreement View, Payment History, Request Status| T
  SYS -->|Dashboards, Rent Overview, Maintenance Queue, Analytics| L
  SYS -->|Assigned Request Queue, Status Confirmation| S
  SYS -->|Platform Metrics, Escalated Complaints, User Records| A

  SYS <-->|Store and Retrieve All Data| DB
  SYS -->|Trigger In-App Notifications| NS
  NS -->|Deliver Notifications| T
  NS -->|Deliver Notifications| L
  NS -->|Deliver Notifications| S
```

## Level 0 DFD
```mermaid
flowchart TD
  T[Tenant]
  L[Landlord]
  S[Maintenance Staff]
  A[Admin]

  P1[1.0 User Management]
  P2[2.0 Property and Unit Management]
  P3[3.0 Tenant Assignment]
  P4[4.0 Rental Agreement Management]
  P5[5.0 Rent Tracking]
  P6[6.0 Maintenance Management]
  P7[7.0 Complaint Management]
  P8[8.0 Notification Management]
  P9[9.0 Dashboard and Analytics]

  D1[(D1 Users)]
  D2[(D2 Properties and Units)]
  D3[(D3 Tenant Assignments)]
  D4[(D4 Rental Agreements)]
  D5[(D5 Rent Payments)]
  D6[(D6 Maintenance Requests)]
  D7[(D7 Complaints)]
  D8[(D8 Notifications)]

  T --> P1
  L --> P1
  S --> P1
  A --> P1
  P1 <--> D1

  L --> P2
  P2 <--> D2

  L --> P3
  T --> P3
  P3 <--> D3

  L --> P4
  T --> P4
  P4 <--> D4

  L --> P5
  T --> P5
  P5 <--> D5

  T --> P6
  L --> P6
  S --> P6
  P6 <--> D6

  T --> P7
  L --> P7
  A --> P7
  P7 <--> D7

  P3 --> P8
  P4 --> P8
  P5 --> P8
  P6 --> P8
  P7 --> P8
  P8 <--> D8
  P8 --> T
  P8 --> L
  P8 --> S

  L --> P9
  T --> P9
  S --> P9
  A --> P9
  P9 --> D2
  P9 --> D5
  P9 --> D6
```

## Level 1 DFD - Process Decomposition

### 1.0 User Management
```mermaid
flowchart TD
  subgraph UM[1.0 User Management]
    UM1[1.1 Register with Role]
    UM2[1.2 Authenticate and Issue JWT]
    UM3[1.3 Refresh Token]
    UM4[1.4 Logout and Revoke Token]
    UM5[1.5 Update Profile]
    UM6[1.6 Admin Activate / Deactivate / Change Role]
  end

  DBU[(D1 Users)]:::db

  UM1 --> DBU
  UM2 --> DBU
  UM3 --> DBU
  UM4 --> DBU
  UM5 --> DBU
  UM6 --> DBU

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 2.0 Property and Unit Management
```mermaid
flowchart TD
  subgraph PM[2.0 Property and Unit Management]
    PM1[2.1 Create / Edit / Delete Property]
    PM2[2.2 List Properties]
    PM3[2.3 Add / Edit / Delete Unit]
    PM4[2.4 View Unit Occupancy Status]
  end

  DBP[(D2 Properties and Units)]:::db

  PM1 --> DBP
  PM2 --> DBP
  PM3 --> DBP
  PM4 --> DBP

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 3.0 Tenant Assignment
```mermaid
flowchart TD
  subgraph TA[3.0 Tenant Assignment]
    TA1[3.1 Assign Tenant to Vacant Unit]
    TA2[3.2 Validate Unit Vacancy]
    TA3[3.3 Remove Tenant from Unit]
    TA4[3.4 Update Unit Occupancy Status]
    TA5[3.5 Trigger Assignment Notification]
  end

  DBU[(D1 Users)]:::db
  DBP[(D2 Properties and Units)]:::db
  DBA[(D3 Tenant Assignments)]:::db
  DBN[(D8 Notifications)]:::db

  TA1 --> TA2
  TA2 --> DBP
  TA1 --> DBA
  TA3 --> DBA
  TA4 --> DBP
  TA1 --> TA5
  TA5 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 4.0 Rental Agreement Management
```mermaid
flowchart TD
  subgraph AG[4.0 Rental Agreement Management]
    AG1[4.1 Create Agreement]
    AG2[4.2 View Agreement - Tenant]
    AG3[4.3 View Agreement History - Landlord]
    AG4[4.4 Auto-Update Status on Expiry]
    AG5[4.5 Trigger Agreement Notification]
  end

  DBAG[(D4 Rental Agreements)]:::db
  DBN[(D8 Notifications)]:::db

  AG1 --> DBAG
  AG2 --> DBAG
  AG3 --> DBAG
  AG4 --> DBAG
  AG1 --> AG5
  AG5 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 5.0 Rent Tracking
```mermaid
flowchart TD
  subgraph RT[5.0 Rent Tracking]
    RT1[5.1 Log Rent Payment]
    RT2[5.2 View Payment History - Tenant]
    RT3[5.3 View Rent Dashboard - Landlord]
    RT4[5.4 Auto-Flag Overdue Rent]
    RT5[5.5 Trigger Rent Due Reminder]
  end

  DBR[(D5 Rent Payments)]:::db
  DBN[(D8 Notifications)]:::db

  RT1 --> DBR
  RT2 --> DBR
  RT3 --> DBR
  RT4 --> DBR
  RT5 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 6.0 Maintenance Management
```mermaid
flowchart TD
  subgraph MM[6.0 Maintenance Management]
    MM1[6.1 Submit Maintenance Request]
    MM2[6.2 View Open Requests - Landlord]
    MM3[6.3 Assign Request to Staff]
    MM4[6.4 View Assigned Requests - Staff]
    MM5[6.5 Update Status - In Progress / Resolved]
    MM6[6.6 Add Resolution Note]
    MM7[6.7 Trigger Maintenance Notifications]
  end

  DBM[(D6 Maintenance Requests)]:::db
  DBN[(D8 Notifications)]:::db

  MM1 --> DBM
  MM2 --> DBM
  MM3 --> DBM
  MM4 --> DBM
  MM5 --> DBM
  MM6 --> DBM
  MM1 --> MM7
  MM3 --> MM7
  MM5 --> MM7
  MM7 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 7.0 Complaint Management
```mermaid
flowchart TD
  subgraph CM[7.0 Complaint Management]
    CM1[7.1 File Complaint - Tenant]
    CM2[7.2 View Complaints - Landlord]
    CM3[7.3 Respond to Complaint - Landlord]
    CM4[7.4 Escalate to Admin - Tenant]
    CM5[7.5 Resolve Complaint - Admin]
    CM6[7.6 Trigger Complaint Notifications]
  end

  DBC[(D7 Complaints)]:::db
  DBN[(D8 Notifications)]:::db

  CM1 --> DBC
  CM2 --> DBC
  CM3 --> DBC
  CM4 --> DBC
  CM5 --> DBC
  CM1 --> CM6
  CM3 --> CM6
  CM5 --> CM6
  CM6 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```

### 8.0 Notification Management
```mermaid
flowchart TD
  subgraph NM[8.0 Notification Management]
    NM1[8.1 Receive Trigger from Source Module]
    NM2[8.2 Create Notification Record]
    NM3[8.3 Deliver In-App Notification]
    NM4[8.4 Mark Notification as Read]
    NM5[8.5 Retry on Delivery Failure]
  end

  DBN[(D8 Notifications)]:::db

  NM1 --> NM2
  NM2 --> DBN
  NM2 --> NM3
  NM3 --> NM4
  NM4 --> DBN
  NM3 --> NM5
  NM5 --> DBN

  classDef db fill:#f2f2f2,stroke:#777,stroke-width:1px;
```
