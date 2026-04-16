# Mask Polymers Recruitment Platform

A full-stack AI-assisted recruitment management system built for Mask Polymers. Covers the complete hiring lifecycle — job posting, candidate applications, MCQ assessments, interviews, offer letters, and HR/Admin dashboards.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand |
| Backend | Node.js, Express 5, Sequelize ORM |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + Email OTP verification |
| Email | Nodemailer (Gmail SMTP) |
| AI | Integrated AI model config for interview question generation |
| File Storage | Multer (local), AWS S3 ready |

---

## Project Structure

```
MSK/
├── frontend/          # Next.js app (port 3000)
│   ├── app/
│   │   ├── admin/     # Admin dashboard, jobs, HR management, approvals, workflows
│   │   ├── hr/        # HR pipeline, interviews, offers
│   │   ├── md/        # MD dashboard, applications review, analytics, final decisions
│   │   ├── candidate/ # Candidate portal, applications, assessments
│   │   ├── login/     # Login page with demo credentials
│   │   └── register/  # Registration with email OTP verification
│   ├── components/    # Shared UI components (shadcn/ui based)
│   │   ├── md/        # MD-specific components (analytics, candidate table, etc.)
│   │   ├── shared/    # Auth guards, layouts, sidebar, topbar
│   │   └── ui/        # Reusable UI primitives (buttons, forms, etc.)
│   └── lib/           # API client, Supabase client, utilities, Zustand store
│
└── backend/           # Express API server (port 5000)
    └── src/
        ├── controllers/   # Route handlers
        ├── models/        # Sequelize models
        ├── routes/        # API route definitions
        ├── services/      # Email, AI, resume parsing
        ├── middleware/     # JWT auth, role guards
        ├── config/        # DB connection
        └── seeds/         # Demo data seeders
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (PostgreSQL)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for OTP emails

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Supabase (Session Pooler connection string)
DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres

SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Gmail SMTP)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

The API runs at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password123 |
| HR | hr@example.com | password123 |
| MD | md@example.com | password123 |
| Candidate | candidate@example.com | password123 |

These are available as one-click quick-login buttons on the login page.

---

## Registration & Email OTP Flow

1. User visits `/register` and fills in name, email, and password.
2. Backend creates the account and sends a **6-digit OTP** to the provided email via Gmail SMTP.
3. User enters the OTP on the verification screen (10-minute expiry, resend available after 60s).
4. On success, account is marked verified and user is redirected to `/login`.
5. Unverified accounts cannot log in.

---

## API Overview

| Prefix | Description |
|---|---|
| `POST /api/auth/register` | Register new user, sends OTP email |
| `POST /api/auth/verify-otp` | Verify email OTP |
| `POST /api/auth/resend-otp` | Resend OTP (rate-limited) |
| `POST /api/auth/login` | Login, returns JWT |
| `GET /api/admin/*` | Admin: dashboard stats, HR management, jobs, AI config, approvals, audit log |
| `GET /api/hr/*` | HR: pipeline, interviews, assessments, offers |
| `GET /api/md/*` | MD: applications review, analytics, final decision making |
| `GET /api/candidate/*` | Candidate: profile, applications, MCQ, documents |
| `GET /api/jobs/*` | Job listings and details |
| `GET /api/interview/*` | Interview scheduling and management |
| `GET /api/offer/*` | Offer letter generation and tracking |

All protected routes require `Authorization: Bearer <token>` header.

---

## User Roles

| Role | Access |
|---|---|
| `ADMIN` | Full system access — users, jobs, workflows, AI config, audit logs |
| `HR` | Recruitment pipeline — applications, interviews, MCQ, offers |
| `MD` | Executive oversight — applications review, analytics, final approval decisions |
| `CANDIDATE` | Self-service portal — apply, take assessments, track status |

---

## Key Features

- **Admin Dashboard** — hiring stats, pipeline charts, recent activity, HR team management
- **MD Dashboard** — executive analytics, candidate performance metrics, final decision approval
- **Job Management** — create/edit job postings with custom workflows
- **Application Pipeline** — Kanban-style stage tracking (Applied → Screening → MCQ → Interview → Offer)
- **MCQ Assessments** — AI-generated questions with proctoring and malpractice detection
- **Interview Management** — scheduling, question banks, feedback collection
- **Offer Letters** — template-based PDF generation and candidate acceptance tracking
- **AI Configuration** — pluggable AI model settings for question generation
- **Audit Log** — full action history for compliance
- **Email Notifications** — OTP verification, interview invites, offer letters

---

## Scripts (Backend)

```bash
node test_admin.js       # Test all admin API endpoints
node test_register.js    # Test registration + OTP flow
node test_email.js       # Test email sending
node seed_demo_data.js   # Re-seed demo users and data
```
