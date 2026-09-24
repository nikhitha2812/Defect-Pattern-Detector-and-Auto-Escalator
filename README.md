# Forge Sentinel — Real-Time Manufacturing Defect Detection & Auto-Escalation System

> **Detect problems early. Escalate automatically. Prevent production losses.**

Forge Sentinel is an enterprise manufacturing quality intelligence platform designed for high-throughput production lines (e.g. EV Battery Modules & Powertrain Assembly). It monitors manufacturing defects in real-time, classifies anomalies into Known, Unknown, and Systemic categories, and automatically triggers escalations (alerts, Non-Conformance Reports, engineering tickets) before localized failures become line-wide outages.

---

## 🏗️ System Architecture

```text
               Manufacturing Telemetry / Event Stream
                                │
                                ▼
                     ┌───────────────────┐
                     │  FastAPI Backend  │
                     └─────────┬─────────┘
                               │
                               ▼
                        Rule Engine
                (Configurable Threshold & Window)
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
     Known Defect        Unknown Defect     Systemic Pattern
   (Documented Fix)     (Auto-Ticket)       (Auto-NCR + Alert)
           │                   │                   │
           └───────────────────┼───────────────────┘
                               ▼
                       SQLite / PostgreSQL
                               │
                               ▼
               React + Vite + Tailwind Dashboard
```

---

## ✨ Key Features

1. **Configurable Rule Engine**: Dynamic evaluation of `occurrences >= threshold` (default: 3) within `time_window` (default: 30 minutes) set via System Settings.
2. **Defect Classification**:
   - **Category 1: Known Defect** — Displays documented solution & resolution checklist.
   - **Category 2: Unknown Defect** — Auto-creates Engineering Ticket (`TICKET-XXXX`) for investigation.
   - **Category 3: Systemic Defect** — Auto-escalates, creates Non-Conformance Report (`NCR-2026-XXXX`), flags station status as `CRITICAL (RED)`, and alerts Line Leader & Field Engineer.
3. **Live Defect Telemetry Stream**: Real-time event feed powered by WebSockets with REST polling backup.
4. **Hackathon Demo Mode**: One-click 2-minute automated scenario demonstrating defect simulation to systemic escalation.
5. **AI Investigation Summary**: AI/Template powered root-cause investigation recommendations for quality managers.
6. **Station Telemetry & Analytics**: Comprehensive Recharts dashboards for first-pass yield, defect rates, shift analysis, and station health.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6
- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn, WebSockets
- **Database**: SQLite / PostgreSQL (zero external setup needed)

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Seeding

```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Seed the database with realistic manufacturing data
python seed.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API server will run at `http://localhost:8000` (Docs available at `http://localhost:8000/docs`).

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🎮 Hackathon Presentation Demo Flow

1. Click **"⚡ Launch Hackathon Demo"** in the top navigation header.
2. Click **"Start Demo Sequence"**.
3. Watch the system:
   - Reset production state (Station `ST-04` has 2 pre-existing `D102` defects).
   - Fire Defect 1 at `ST-04` (`SN-DEMO-1001`).
   - Fire Defect 2 at `ST-04` (`SN-DEMO-1002`).
   - Fire Defect 3 at `ST-04` (`SN-DEMO-1003`) -> **3 occurrences reached within 30 min window!**
   - Pop up **CRITICAL SYSTEMIC ISSUE DETECTED** escalation modal.
   - Show auto-generated **NCR-2026-XXXX**, affected unit serial list, and AI investigation summary.

---

## 📡 REST API Summary

- `POST /api/auth/login` — Role-based access authentication
- `GET /api/dashboard/summary` — Dashboard KPI counters
- `GET /api/dashboard/charts` — Recharts analytics series
- `GET /api/defects` — Query defect stream
- `POST /api/defects/simulate` — Submit defect telemetry & execute rule engine
- `GET /api/patterns` — Query detected pattern clusters
- `GET /api/patterns/{id}/ai-summary` — AI engineer investigation summary
- `GET /api/ncrs` & `PUT /api/ncrs/{id}` — Manage Non-Conformance Reports
- `GET /api/tickets` & `PUT /api/tickets/{id}` — Manage Engineering Tickets
- `GET /api/alerts` & `PUT /api/alerts/{id}/ack` — Notification center
- `GET /api/settings` & `PUT /api/settings` — Configure systemic threshold & time window parameters
- `POST /api/demo/reset` & `POST /api/demo/simulate-sequence` — Presentation controls
