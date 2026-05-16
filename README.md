# 🚀 PlanLuhh

> All-in-one wedding planning app built for Malaysian couples — from akad nikah to honeymoon, in one place.

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [User Flow](#-user-flow)
- [Auth Flow](#-auth--session-flow)
- [Database](#-database-erd)
- [API Structure](#-api-structure)
- [Frontend Components](#-frontend-components)
- [Feature Flows](#-feature-specific-flows)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

PlanLuhh is a web-based wedding planning platform built specifically for Malaysian couples navigating the full journey from nikah to sanding and beyond. It consolidates everything — budget tracking, vendor management, e-invitations, RSVP, seating, hantaran, honeymoon planning — into one private dashboard, removing the need for scattered spreadsheets and WhatsApp notes.

**Type:** `Solo`
**Brand:** `Luhh Series`
**Built with:** Independent

---

## ✨ Features

- ✅ Auth — Email → OTP → Set Password → Login (JWT in HttpOnly cookies)
- ✅ Dashboard — Stats, countdown, Journey Book PDF export
- ✅ Budget Tracker — Categories, estimated vs actual vs paid, PDF + Excel export
- ✅ Moodboard — Pinterest-style inspiration board with custom categories
- ✅ Vendor Manager — Pipeline tracking with status flow + comparison view
- ✅ Document Hub — Official nikah document checklist + file vault
- ✅ Schedule — Pre-wedding appointment timeline
- ✅ Rundown — Minit-seminit aturcara for each majlis
- ✅ Checklist / Tasks — Phase-based to-do list with pre-populated Malaysian wedding tasks
- ✅ Guest List — RSVP-synced guest management with pax tracking
- ✅ Menu — Caterer or rewang mode with dish tracking
- ✅ Hantaran Tracker — Dulang items for both sides with status flow
- ✅ E-Invitation Builder — Animated digital invitation with 13 sections + custom design upload
- ✅ RSVP Dashboard — Real-time response tracking from public invitation
- ✅ Seating — Drag-and-drop table assignment for confirmed guests
- ✅ Gift Registry — Registry management + received gifts tracker
- ✅ Honeymoon Planner — Destination comparison, budget, itinerary, packing list
- ✅ Journey Book PDF — Full wedding summary PDF generated client-side

---

## 🛠 Tech Stack

```mermaid
graph TD
    subgraph Frontend
        FE["React 18 + Vite"]
        UI["Tailwind CSS + Lucide React"]
        ST["React Query v3 + React Hook Form"]
        AN["Framer Motion"]
        PDF["@react-pdf/renderer"]
    end
    subgraph Backend
        BE["FastAPI (Python 3.12)"]
        AU["JWT (HttpOnly cookies)"]
        RL["SlowAPI rate limiting"]
    end
    subgraph Infrastructure
        DB[("PostgreSQL 16")]
        UP["File Uploads\n/uploads static dir"]
        ML["SMTP (FastAPI-Mail)"]
    end
    FE --> BE
    BE --> DB
    BE --> ML
    BE --> UP
```

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| UI | Tailwind CSS, Lucide React, Framer Motion |
| State / Data | React Query v3, React Hook Form, Zod, Axios |
| PDF | @react-pdf/renderer v4.5.1 (client-side), ReportLab (server-side exports) |
| Backend | FastAPI (Python), SQLAlchemy ORM, Alembic, Uvicorn |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh) stored in HttpOnly cookies |
| Email | FastAPI-Mail via SMTP (OTP + reset links) |
| Security | AES/Fernet encryption for financial fields, SlowAPI rate limiting |
| Hosting | Docker Compose (3 containers: db, backend, frontend) |

---

## 📌 Architecture

### High-level Architecture

```mermaid
graph TD
    U[User / Browser] --> FE[React Frontend :5173]
    PG[Guest / Public] --> INV[Public Invitation /i/:slug]
    INV --> API
    FE --> API[FastAPI Backend :8000]
    API --> DB[(PostgreSQL :5432)]
    API --> SMTP[SMTP Mail Server]
    API --> FS[File Storage /uploads]
```

### System Architecture

```mermaid
graph TD
    subgraph Frontend
        P[Pages] --> C[Components]
        C --> H[api.js / Axios + React Query]
    end
    subgraph Backend
        R[Routers /api/v1] --> MW[JWT Middleware + Rate Limiter]
        MW --> E[Route Handlers]
        E --> S[SQLAlchemy ORM]
        S --> DB[(PostgreSQL)]
    end
    H --> R
    E --> EXT[FastAPI-Mail / File System]
```

---

## 👤 User Flow

```mermaid
flowchart TD
    A([Start]) --> B[Landing / Root]
    B --> C{Logged in?}
    C -->|No| D[Register or Login]
    C -->|Yes| E[Dashboard — Mission Control]
    D --> D1[Enter Email]
    D1 --> D2[Verify OTP]
    D2 --> D3[Set Password]
    D3 --> E
    E --> F{First time?}
    F -->|Yes| G[Create Wedding Settings]
    F -->|No| H[Plan everything]
    G --> H
    H --> I[Foundation — Budget, Moodboard, Vendors, Documents]
    H --> J[Planning — Schedule, Rundown, Checklist, Guests, Menu, Hantaran]
    H --> K[Execution — E-Invitation, RSVP, Seating]
    H --> L[Post-Wedding — Gifts, Honeymoon]
```

### Page Map

```mermaid
graph TD
    subgraph Public ["🌐 Public Routes"]
        ROOT["/"]
        AUTH["/login · /register · /verify-otp · /set-password · /forgot-password"]
        INV["/i/:slug — Public E-Invitation"]
    end
    subgraph Protected ["🔐 Protected Routes"]
        DASH["/dashboard — Mission Control"]
        PROF["/dashboard/profile"]
        FOUND["Foundation\n/foundation/budget\n/foundation/moodboard\n/foundation/vendors\n/foundation/documents"]
        PLAN["Planning\n/planning/schedule\n/planning/rundown\n/planning/tasks\n/planning/guests\n/planning/menu\n/planning/hantaran"]
        EXEC["Execution\n/execution/invitation\n/execution/rsvp\n/execution/seating"]
        POST["Post-Wedding\n/post-wedding/gifts\n/post-wedding/honeymoon"]
    end
    ROOT --> AUTH
    AUTH --> DASH
    DASH --> FOUND
    DASH --> PLAN
    DASH --> EXEC
    DASH --> POST
    DASH --> PROF

    style Public fill:#e8f5e9,stroke:#4caf50
    style Protected fill:#e3f2fd,stroke:#2196f3
```

---

## 🔐 Auth & Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    participant ML as SMTP Mail

    Note over U,ML: Registration
    U->>FE: Enter email
    FE->>API: POST /api/v1/auth/register
    API->>ML: Send 6-digit OTP
    ML-->>U: OTP email
    U->>FE: Enter OTP
    FE->>API: POST /api/v1/auth/verify-otp
    API->>FE: OTP verified
    U->>FE: Set password
    FE->>API: POST /api/v1/auth/set-password
    API->>DB: Create user (bcrypt hash)
    DB-->>API: User created
    API-->>FE: 201 Created

    Note over U,ML: Login
    U->>FE: Email + password
    FE->>API: POST /api/v1/auth/login
    API->>DB: Validate credentials
    DB-->>API: User found
    API-->>FE: Set HttpOnly cookies (access_token + refresh_token)
    FE-->>U: Redirect to /dashboard
```

### Token Lifecycle

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as FastAPI

    FE->>API: Request + HttpOnly access_token cookie
    API-->>FE: 401 Token Expired
    FE->>API: POST /api/v1/auth/refresh (refresh_token cookie)
    API-->>FE: New access_token cookie set
    FE->>API: Retry original request
    API-->>FE: 200 OK
```

---

## 🗄️ Database (ERD)

### Core ERD

```mermaid
erDiagram
    USER {
        uuid id PK
        string email
        string full_name
        string phone
        string password_hash
        timestamp created_at
    }
    WEDDING {
        uuid id PK
        uuid user_id FK
        string nama_lelaki
        string nama_perempuan
        date tarikh_utama
        string venue_utama
        decimal budget_ceiling
        date tarikh_nikah
        string venue_nikah
        date tarikh_sanding_perempuan
        date tarikh_sanding_lelaki
        timestamp created_at
    }
    OTP {
        uuid id PK
        uuid user_id FK
        string code
        timestamp expires_at
        bool used
    }
    COLLABORATOR {
        uuid id PK
        uuid wedding_id FK
        uuid user_id FK
        string role
    }
    USER ||--o{ WEDDING : "owns"
    USER ||--o{ OTP : "receives"
    WEDDING ||--o{ COLLABORATOR : "has"
```

### Feature ERD

```mermaid
erDiagram
    BUDGET_ITEM {
        uuid id PK
        uuid wedding_id FK
        string item_name
        string category
        decimal estimated
        decimal actual
        decimal paid
        string payment_by
        date due_date
        string status
    }
    VENDOR {
        uuid id PK
        uuid wedding_id FK
        string name
        string category
        string status
        string contact_name
        string phone
        decimal price
    }
    GUEST {
        uuid id PK
        uuid wedding_id FK
        string name
        string side
        int expected_pax
        string rsvp_status
        int confirmed_pax
        string assigned_table
        bool is_vip
    }
    INVITATION {
        uuid id PK
        uuid wedding_id FK
        string slug
        bool is_published
        bool use_custom_design
        json card_builder_config
    }
    INVITATION_CUSTOM_PAGE {
        uuid id PK
        uuid invitation_id FK
        string file_path
        int page_order
    }
    SEATING_TABLE {
        uuid id PK
        uuid wedding_id FK
        string table_name
        int capacity
    }
    GIFT_ITEM {
        uuid id PK
        uuid wedding_id FK
        string item_name
        string link
        int target_quantity
        int claimed_count
    }
    WEDDING ||--o{ BUDGET_ITEM : "has"
    WEDDING ||--o{ VENDOR : "has"
    WEDDING ||--o{ GUEST : "has"
    WEDDING ||--|| INVITATION : "has"
    INVITATION ||--o{ INVITATION_CUSTOM_PAGE : "has"
    WEDDING ||--o{ SEATING_TABLE : "has"
    WEDDING ||--o{ GIFT_ITEM : "has"
```

### Database Schema Overview

| Table | Purpose | Key Relations |
|---|---|---|
| `users` | Auth + profile | — |
| `weddings` | Wedding settings + event dates | belongs to `users` |
| `collaborators` | Partner/coordinator access | belongs to `weddings`, `users` |
| `otp` | Email OTP verification | belongs to `users` |
| `budget_items` | Budget line items | belongs to `weddings` |
| `vendors` | Vendor pipeline | belongs to `weddings` |
| `vendor_extras` | Vendor documents + reviews | belongs to `vendors` |
| `tasks` | Checklist / to-do items | belongs to `weddings` |
| `guests` | Guest list | belongs to `weddings` |
| `moodboard_items` | Inspiration images | belongs to `weddings` |
| `schedules` | Pre-wedding appointments | belongs to `weddings` |
| `rundown` | Day-of aturcara entries | belongs to `weddings` |
| `hantaran` | Dulang hantaran items | belongs to `weddings` |
| `menu_items` | Food menu | belongs to `weddings` |
| `invitations` | E-invitation config | belongs to `weddings` |
| `invitation_custom_pages` | Uploaded custom design pages | belongs to `invitations` |
| `seating` | Table layout + assignments | belongs to `weddings` |
| `gifts` | Gift registry + received gifts | belongs to `weddings` |
| `honeymoon` | Destination, itinerary, packing | belongs to `weddings` |
| `document_checklist` | Nikah document checklist | belongs to `weddings` |
| `audit_logs` | Action audit trail | belongs to `users` |

---

## 🔌 API Structure

### API Overview

```mermaid
mindmap
  root((API /api/v1))
    auth
      POST /auth/register
      POST /auth/verify-otp
      POST /auth/set-password
      POST /auth/login
      POST /auth/refresh
      POST /auth/logout
      POST /auth/forgot-password
      POST /auth/reset-password
    users
      GET /users/me
      PATCH /users/me
      PATCH /users/me/password
    wedding
      GET /wedding
      POST /wedding
      PATCH /wedding
    budget
      GET /budget
      POST /budget
      PATCH /budget/:id
      DELETE /budget/:id
    vendors
      GET /vendors
      POST /vendors
      PATCH /vendors/:id
      DELETE /vendors/:id
    guests
      GET /guests
      POST /guests
      PATCH /guests/:id
      DELETE /guests/:id
      POST /guests/import
    tasks
      GET /tasks
      POST /tasks
      PATCH /tasks/:id
      DELETE /tasks/:id
    invitation
      GET /invitation
      POST /invitation
      PATCH /invitation
      POST /invitation/custom-pages
      DELETE /invitation/custom-pages/:id
      GET /invitation/public/:slug
      POST /invitation/public/:slug/rsvp
      POST /invitation/public/:slug/wish
      POST /invitation/public/:slug/gift-claim/:id
    moodboard
      GET /moodboard
      POST /moodboard
      PATCH /moodboard/:id
      DELETE /moodboard/:id
    schedule
      GET /schedule
      POST /schedule
      PATCH /schedule/:id
      DELETE /schedule/:id
    rundown
      GET /rundown
      POST /rundown
      PATCH /rundown/:id
      DELETE /rundown/:id
    hantaran
      GET /hantaran
      POST /hantaran
      PATCH /hantaran/:id
      DELETE /hantaran/:id
    menu
      GET /menu
      POST /menu
      PATCH /menu/:id
      DELETE /menu/:id
    seating
      GET /seating
      POST /seating/tables
      PATCH /seating/tables/:id
      DELETE /seating/tables/:id
      POST /seating/assign
    documents
      GET /documents
      PATCH /documents/:id
      POST /documents/:id/upload
    gifts
      GET /gifts
      POST /gifts
      PATCH /gifts/:id
      DELETE /gifts/:id
    honeymoon
      GET /honeymoon
      POST /honeymoon
      PATCH /honeymoon/:id
```

### Request/Response Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant RL as SlowAPI Rate Limiter
    participant MW as JWT Middleware
    participant API as Route Handler
    participant ORM as SQLAlchemy
    participant DB as PostgreSQL

    FE->>RL: Request + HttpOnly cookie
    RL->>MW: Pass (if within rate limit)
    MW->>MW: Decode + validate JWT
    MW->>API: Inject current_user
    API->>ORM: Query / mutate
    ORM->>DB: SQL
    DB-->>ORM: Rows
    ORM-->>API: ORM objects
    API-->>FE: JSON response
```

---

## 🧩 Frontend Components

### Component Tree

```mermaid
graph TD
    App["App.jsx\n(Routes + AuthProvider)"]
    App --> Auth["AuthContext\n(global auth state + user)"]
    App --> PR["ProtectedRoute\n(redirect if unauthenticated)"]
    PR --> Layout["DashboardLayout\n(sidebar + outlet)"]
    Layout --> Dash["MissionControlPage\n/dashboard"]
    Layout --> Foundation["Foundation Pages\nBudget, Moodboard, Vendors, Documents"]
    Layout --> Planning["Planning Pages\nSchedule, Rundown, Tasks, Guests, Menu, Hantaran"]
    Layout --> Execution["Execution Pages\nInvitationBuilder, RSVPDashboard, Seating"]
    Layout --> PostWed["Post-Wedding Pages\nGiftRegistry, Honeymoon"]
    Layout --> Profile["ProfilePage"]
    App --> AuthPages["Auth Pages\nLogin, Register, VerifyOTP, SetPassword, ForgotPassword"]
    App --> InvPub["InvitationPublicPage\n/i/:slug"]
    App --> PDF["JourneyBook.jsx\n@react-pdf/renderer"]
```

### Key Components

| Component | Purpose |
|---|---|
| `DashboardLayout` | Sidebar nav + `<Outlet>` wrapper for all protected pages |
| `AuthContext` | Global auth state — current user, login/logout, token refresh |
| `ProtectedRoute` | Redirects unauthenticated users to `/login` |
| `JourneyBook` | Client-side PDF renderer — full wedding summary export |
| `InvitationPublicPage` | Public-facing invitation page with RSVP, wishes, gift claim |
| `MissionControlPage` | Dashboard home — stats, countdown, settings form |
| `InvitationBuilderPage` | 13-section invitation builder with live preview |

---

## ⚙️ Feature-specific Flows

### E-Invitation Publish & RSVP Flow

```mermaid
sequenceDiagram
    participant O as Owner
    participant FE as Frontend
    participant API as Backend
    participant G as Guest (Public)

    O->>FE: Configure invitation (13 sections)
    FE->>API: PATCH /api/v1/invitation
    O->>FE: Toggle Publish
    FE->>API: PATCH /api/v1/invitation {is_published: true}
    API-->>FE: Invitation live at /i/:slug

    G->>API: GET /api/v1/invitation/public/:slug
    API-->>G: Invitation data
    G->>API: POST /api/v1/invitation/public/:slug/rsvp
    API->>API: Create RSVP + match to guest list
    API-->>G: 201 Submitted
    FE->>API: GET /api/v1/guests
    API-->>FE: Updated RSVP statuses
```

### Custom Design Upload Flow

```mermaid
flowchart TD
    A["Owner clicks 'Upload Sendiri'"] --> B["Select image files\n(1080×1920px, 9:16)"]
    B --> C{Client-side ratio check\n0.505 – 0.620?}
    C -->|Fail| D["Show validation error"]
    C -->|Pass| E["POST /invitation/custom-pages\nmultipart upload"]
    E --> F["Stored at /uploads/custom-design/{wedding_id}/"]
    F --> G["use_custom_design = true"]
    G --> H{Guest views invitation}
    H --> I["CustomPagesViewer\nfull-screen slide viewer"]
    I --> J["Tap left → prev\nTap right → next\nDot indicators"]
```

### Gift Registry Claim Flow

```mermaid
flowchart TD
    A["Guest views Gift Registry\non public invitation"] --> B{Item available?}
    B -->|Yes| C["Click 'Beli'"]
    C --> D["POST /invitation/public/:slug/gift-claim/:id"]
    D --> E["claimed_count + 1"]
    E --> F{claimed_count >= target_quantity?}
    F -->|Yes| G["Status → Fully Claimed\nButton disabled: 'Dah ditempah'"]
    F -->|No| H["Partial claim shown\n'X / Y claimed'"]
    B -->|No| I["Button disabled"]
```

### Role & Permission Matrix

| Action | Owner / Admin | Partner | Coordinator |
|---|---|---|---|
| Create / edit Wedding Settings | ✅ | ✅ | ❌ |
| Manage all planning modules | ✅ | ✅ | ❌ |
| Publish / unpublish E-Invitation | ✅ | ❌ | ❌ |
| View Schedule, Rundown, Guests | ✅ | ✅ | ✅ |
| Moderate guestbook wishes | ✅ | ✅ | ❌ |

---

## 🚀 Getting Started

### Prerequisites

- Python `>=3.11`
- Node.js `>=18`
- Docker + Docker Compose

### Running with Docker (Recommended)

```bash
git clone https://github.com/snsyaqirah/PlanLuhh.git
cd PlanLuhh

# Copy and fill backend env
cp backend/.env.example backend/.env

# Start all 3 containers (db + backend + frontend)
docker compose up --build
```

```mermaid
graph LR
    subgraph Dev ["docker-compose.yml"]
        D1["frontend\nReact + Vite :5173\nhot reload"]
        D2["backend\nFastAPI :8000\n--reload"]
        D3[("db\nPostgreSQL :5432")]
        D2 -. "DATABASE_URL" .-> D3
        D1 -. "VITE_API_URL" .-> D2
    end
    B["🌐 Browser"] --> D1
```

| Service | Dev URL | Notes |
|---|---|---|
| Frontend | http://localhost:5173 | React + Vite dev server |
| Backend | http://localhost:8000 | FastAPI + Uvicorn with --reload |
| API Docs | http://localhost:8000/docs | Swagger UI (dev only) |
| Database | localhost:5432 | PostgreSQL 16 |

### Running locally (without Docker)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in values
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# App
APP_NAME=PlanLuhh
APP_ENV=development
SECRET_KEY=your-super-secret-key-min-32-chars-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql://planluhh_user:planluhh_pass@localhost:5432/planluhh_db

# Email (SMTP)
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@planluhh.com
MAIL_FROM_NAME=PlanLuhh
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# Encryption (financial fields — AES/Fernet)
ENCRYPTION_KEY=your-fernet-key  # python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# OTP
OTP_EXPIRE_MINUTES=10
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

> Copy `backend/.env.example` to `backend/.env` and fill in your values before running.

---

## ☁️ Deployment

```mermaid
graph LR
    GH["GitHub\nmain branch"] -->|push| CI["CI/CD\nGitHub Actions"]
    CI --> FE["Vercel / Netlify\nFrontend SPA"]
    CI --> BE["Railway / Fly.io\nFastAPI Backend"]
    BE --> DB[("Supabase / Neon\nPostgreSQL")]
    BE --> ML["SMTP\nEmail service"]
```

| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel / Netlify | React SPA |
| Backend | Railway / Fly.io | FastAPI + file uploads |
| Database | Supabase / Neon | PostgreSQL |

---

## 📁 Project Structure

```
PlanLuhh/
├── docker-compose.yml
├── DOCS.md
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── dashboard/        # DashboardLayout (sidebar)
│   │   │   ├── pdf/              # JourneyBook PDF renderer
│   │   │   └── shared/           # ProtectedRoute
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── data/
│   │   │   └── invitationDesigns.js
│   │   ├── pages/
│   │   │   ├── auth/             # Login, Register, OTP, SetPassword, ForgotPassword
│   │   │   ├── dashboard/        # All 18 protected pages
│   │   │   └── invitation/       # Public invitation page
│   │   └── utils/
│   │       └── api.js            # Axios instance + React Query setup
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── app/
    │   ├── main.py               # FastAPI app + router registration
    │   ├── core/
    │   │   ├── config.py         # Settings (pydantic-settings)
    │   │   ├── database.py       # SQLAlchemy engine + session
    │   │   ├── deps.py           # Dependency injection (get_db, get_current_user)
    │   │   └── security.py       # JWT + Fernet encryption
    │   ├── models/               # SQLAlchemy ORM models (18 files)
    │   ├── routers/              # FastAPI route handlers (18 files)
    │   ├── schemas/              # Pydantic request/response schemas (18 files)
    │   └── utils/
    │       ├── email.py          # OTP + reset email sending
    │       ├── otp.py            # OTP generation
    │       ├── export.py         # PDF + Excel export (ReportLab + openpyxl)
    │       └── audit.py          # Audit log writer
    ├── alembic/                  # Database migrations
    ├── Dockerfile
    └── requirements.txt
```

---

## 🗺 Roadmap

- [x] Auth — OTP email flow + JWT HttpOnly cookies
- [x] All 16 planning modules (Dashboard → Honeymoon)
- [x] E-Invitation Builder — 13 sections + custom design upload
- [x] Journey Book PDF export (client-side, @react-pdf/renderer)
- [x] Budget PDF + Excel export (server-side, ReportLab + openpyxl)
- [x] AES encryption for financial data at rest
- [ ] Partner invite via email (RBAC collaborative planning)
- [ ] Push notifications (upcoming tasks, RSVP updates)
- [ ] Mobile-responsive polish
- [ ] AI-assisted vendor recommendations

---

## 📄 License

[MIT](LICENSE) © 2025 Syaqirah

---
