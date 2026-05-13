<div align="center">
  <img src="https://raw.githubusercontent.com/Samarth-Ghare/Mask-Polymers/main/frontend/public/images/logo.png" alt="AI Hiring System" width="120" />
  <h1>🚀 AI Hiring System (Enterprise Recruitment OS)</h1>
  <p><strong>Next-Generation, AI-Driven Professional Assessment & Pipeline Management Infrastructure</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge&logo=vercel" alt="Status" />
    <img src="https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Gemini_AI-Pro-8E75B2?style=for-the-badge&logo=googlebard" alt="Gemini AI" />
  </p>
</div>

---

## 📖 Overview

The **AI Hiring System** is a mission-critical, end-to-end recruitment orchestration platform designed for high-stakes enterprise evaluation. By leveraging a hybrid AI/ML engine, the platform delivers precise candidate scoring, real-time proctored assessments, dynamic technical interviews, and highly automated governance workflows.

It is built for **scale, security, and precision**, acting as an un-biased, high-fidelity recruitment pipeline that connects candidates, HR teams, and Managing Directors (MD) through a centralized intelligence hub.

---

## ✨ Enterprise Features

### 🧠 1. Hybrid AI Assessment & Interview Engine
- **Automated Resume Parsing**: High-accuracy semantic extraction mapping candidates to role requirements.
- **Dynamic Technical Assessments**: Real-time generation of coding/logic questions uniquely tailored to the candidate's applied role.
- **Conversational Voice AI**: Integrated speech-to-text dictation pipelines for phase 5 subjective interviews.
- **Objective Scoring**: Multi-dimensional scoring (Integrity, Technical, Behavioral, Resume) utilizing Google Gemini Pro.

### 🛡️ 2. Proctoring Vanguard (Zero-Trust Security)
- **Isolation Breach Detection**: Hard-locks the interface on tab-switches or fullscreen exits during critical assessments.
- **Malpractice Telemetry**: Real-time logging of behavioral anomalies, copy-paste attempts, and window blurs.
- **Biometric Identity Integrity**: Automatic candidate profile picture capturing and ongoing verification.

### ⚙️ 3. Operational Governance & Dashboards
- **Multi-Stakeholder Workflows**: Dedicated secure portals for Candidates, HR, and Managing Directors.
- **Real-Time Dashboards**: WebSockets/Polling-driven telemetry featuring hiring funnels, pipeline velocity, and active MD decisions.
- **Automated Offer Generation**: Highly customizable, legally compliant offer letters dispatched instantly upon candidate acceptance.
- **Immutable Audit Logs**: Comprehensive compliance registry tracking every system mutation, AI recommendation, and policy change.

---

## 🏗️ Architecture & Tech Stack

The platform relies on a decoupled, horizontally scalable monorepo structure.

### 💻 Frontend (Client Application)
- **Framework**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS + Shadcn UI (Industrial Electric Blue Aesthetic)
- **State & Data**: TanStack Query (React Query) for real-time polling, Zustand for global UI state
- **Visualization**: Recharts for dense, interactive analytics
- **Build Tool**: Webpack / Turbopack

### 🖧 Backend (Core API & AI Orchestrator)
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL (Managed via Supabase)
- **ORM**: Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **AI Integration**: Google Generative AI SDK (Gemini Pro & Gemini Vision)
- **File Storage**: Local temporary secure blobs & Supabase buckets

---

## 🛠️ Quick Start & Deployment Protocol

Follow these instructions to boot the system in a local development environment.

### Prerequisites
- Node.js (v18.x or higher)
- PostgreSQL Database (Local or Cloud like Supabase)
- Google Gemini AI API Key
- SendGrid or standard SMTP credentials (for email automation)

### 1. Repository Setup
```bash
git clone https://github.com/Samarth-Ghare/Mask-Polymers.git
cd Mask-Polymers
```

### 2. Backend Initialization
```bash
cd backend
npm install

# Create your environment file based on the template
cp .env.example .env
```

**Required `.env` Variables (Backend):**
```env
PORT=5000
DB_HOST=your-postgres-host
DB_USER=your-postgres-user
DB_PASSWORD=your-postgres-password
DB_NAME=your-db-name
DB_PORT=5432
JWT_SECRET=your-secure-secret
GEMINI_API_KEY=your-google-gemini-key
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-smtp-app-password
```

**Start the Backend Server:**
```bash
npm run dev
# The backend will automatically sync database tables and start on port 5000.
```

### 3. Frontend Initialization
Open a new terminal window.
```bash
cd frontend
npm install

# Create your environment file
cp .env.example .env.local
```

**Required `.env.local` Variables (Frontend):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the Frontend App:**
```bash
npm run dev
# The application will compile and be available at http://localhost:3000
```

---

## 🔐 Access Control (RBAC Matrix)

The system enforces strict role segregation to ensure data privacy and workflow integrity.

| Role | System Capabilities |
|---|---|
| **ADMIN** | Full Platform Config, AI Model Management, Workflow Mapping, Audit & Data Retention Policies |
| **MD (Executive)** | Strategic Overview, Pipeline Bottlenecks, Final Candidate Approval |
| **HR (Operations)** | Candidate Pipeline Management, Interview Scheduling, Internal Notes, Offer Dispatching |
| **CANDIDATE** | Application Tracking, Secure Assessment Hub, Video/Voice Interviews, Offer Acceptance |

---

## 🚀 Roadmap & Future Horizons
- [ ] **Real-time Video Proctoring**: Integration of OpenCV for live gaze-tracking and multiple-face detection.
- [ ] **Predictive Employee LTV**: ML models to forecast candidate tenure and success probability.
- [ ] **Multi-Tenant SaaS Architecture**: Expanding the database schema to support independent organizations.

---

<div align="center">
  <p>Built with precision by the <b>AI Hiring System Engineering Team</b>.</p>
  <p><i>SEC LEVEL 4 ACCREDITED — FOR INDUSTRIAL USE ONLY</i></p>
</div>
