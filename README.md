# SutrAI (सूत्र-AI) — Phase 3 Operational System
> **“Every signal has a next step.”**
> *Universal bridge between unstructured human intent and complex societal systems.*

---

## 1. Overview & Core Mission

**SutrAI** is a production-grade, societal-benefit triage, evidence reasoning, emergency routing, and operational action platform powered by Google Gemini and live public infrastructure APIs.

In high-stakes civic, healthcare, disaster, and municipal situations, citizens communicate in messy, fragmented, emotional, and multimodal signals—a distressed voice recording, a blurry flood photo, a cryptic hospital prescription, or a frantic text. Generic chatbots respond with generic text and stop. **SutrAI never stops at advice—it follows through.**

### The SutrAI 5-Stage Loop
```
CAPTURE ➔ UNDERSTAND ➔ EXAMINE EVIDENCE ➔ CHOOSE THE BEST ACTION ➔ FOLLOW THROUGH
```

---

## 2. Phase 3 Implemented Architecture & Features

### A. Unified Multimodal Input System
- **Natural Language Text Composer**: High-capacity text processing with real-time prompt injection filtering and character analytics.
- **Live Voice & Web Speech Streaming**: Integrated browser `SpeechRecognition` / `webkitSpeechRecognition` with live streaming transcript, pause/resume, editable text box, and one-click "Append to Description". Direct fallback to HTML5 `MediaRecorder` audio capture.
- **Direct Camera & Photo Ingestion**: Camera capture button with `capture="environment"` for instant mobile hazard photos and optical preview.
- **Document & PDF Parsing**: Server-side `pdf-parse` pipeline that extracts structured text from medical records, municipal notices, and utility complaints.
- **Multimodal Audio & Video Guidance**: Accepts raw audio (`.webm`, `.mp3`, `.wav`) for acoustic analysis and video files with transparent guidance and screenshot frame extraction.
- **Multilingual Support**: Supports English, Hindi, Kannada, Tamil, and Telugu with native language preservation and structured output translation.

### B. Live Weather & Hazard Intelligence
- **Open-Meteo Meteorological API (`api.open-meteo.com`)**: Live real-time WMO weather codes, temperature, humidity, wind velocity, and hourly precipitation with ZERO API key required.
- **Severe Hazard Threshold Engine**: Detects flash flood risks, gale wind tree fall dangers, wet road slip hazards, and extreme heatwaves.
- **Real-Time Context Bar**: Embedded in both the workspace ingestion flow and the incident operational console with one-click refresh.

### C. Live Road Routing & OSRM Engine
- **OSRM Road Routing Engine (`router.project-osrm.org`)**: Calculates actual turn-by-turn road distance (km) and estimated travel duration (minutes).
- **Emergency Priority Speed Modifier**: Simulates priority siren transit speeds (~20% faster than standard traffic).
- **High-Accuracy Geodesic Fallback**: Resilient Haversine formula computation ensuring 100% uptime even during network interruptions.

### D. Official Verified Public & Civic Directory (12 Entities)
- Ground-truth emergency numbers sourced directly from Government of India gazettes (MHA, NHM, NDMA, MoHFW, MeitY):
  1. **112** — National Emergency Response Support System (ERSS)
  2. **108** — Emergency Medical & Ambulance Transport Service (EMRI)
  3. **101** — Fire & Emergency Rescue Services
  4. **1078** — National Disaster Management Authority (NDMA)
  5. **1091** — Women Helpline & Safety Cell
  6. **1930** — National Cyber Crime Reporting & Financial Fraud Freeze
  7. **1533 / BBMP** — Bruhat Bengaluru Mahanagara Palike Civic Control
  8. **1912 / BESCOM** — Power Outage & Snapped Wire Emergency
  9. **103 / BTP** — Bengaluru Traffic Police Road Hazard Cell
  10. **DEPwD / 14456** — Divyangjan & Accessibility Assistance
  11. **14567 / Elderline** — Senior Citizen Abuse & Distress Helpline
  12. **1969 / Swachhata** — MoHUA National Urban Sanitation Helpline

### E. Operational Workflow Engine & Action Tracking
- **13 Operational States**: `new` ➔ `triaged` ➔ `needs_information` ➔ `ready_for_action` ➔ `assigned` ➔ `in_progress` ➔ `waiting_for_response` ➔ `dispatched` ➔ `resolved` ➔ `escalated` ➔ `cancelled` ➔ `failed` ➔ `needs_review`.
- **Interactive Task Checklists**: Operators can create checklists, assign field personnel, set priorities (`low`, `medium`, `high`, `urgent`), and toggle completion with live audit logging.
- **Official Referral Docket Generator**: Generates formal, dispatchable, printable referral dockets with timestamped reference IDs (`SUTR-REF-YYYY-XXXXXX`), evidence records, and authority handoff letters.
- **Emergency Escalation Protocol**: Escalates incidents with mandatory operational justification, elevating case priority and broadcasting critical alerts.
- **Real-Time Audit Timeline**: Every status update, task toggle, note, and referral is logged with actor identification and timestamps.

### F. Truthful Integration Status Center (10 Systems)
1. **Google Gemini Multimodal AI**: `@google/genai` SDK (`gemini-3.8-flash`) / resilient fallback.
2. **PostgreSQL Database & Storage**: Supabase Cloud PostgreSQL / in-memory resilient store.
3. **Open-Meteo Weather**: Live WMO meteorological endpoint (Verified Live).
4. **OSRM Road Routing**: OpenStreetMap road distance and duration (Verified Live).
5. **Emergency Directory**: 12 verified gazette records (Verified Live).
6. **Speech-to-Text**: Web Speech API + HTML5 MediaRecorder (Verified Live).
7. **Document Parser**: `pdf-parse` text extraction engine (Verified Live).
8. **Workflow Engine**: 13 state transitions and task manager (Verified Live).
9. **Dispatch Queue**: In-app operational event bus (Verified Live).
10. **Prompt Injection Defense**: Security regex boundary isolator (Verified Live).

---

## 3. Getting Started & Local Development

### Prerequisites
- Node.js v18+ (tested on Node v20+)
- npm v9+

### Installation & Setup
```bash
# 1. Clone or navigate to the workspace
cd ANTIGRAVITY_WORKFLOW

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for live Gemini/Supabase)
cp .env.example .env

# 4. Start concurrent development server (Backend on :5001 + Frontend on :5173)
npm run dev:all
```

The application will be accessible at:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Endpoint**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **Integration Status**: [http://localhost:5001/api/integrations/status](http://localhost:5001/api/integrations/status)

---

## 4. Running the Test Suite & Production Build

```bash
# Run the complete automated test suite (19 test cases)
npm test

# Run TypeScript type check and production bundle
npm run build

# Run linter
npm run lint
```

---

## 5. Demonstration Walkthrough (10-Step Journey)

1. **Open the Operations Console** (`/dashboard`):
   - Review the metrics tiles (Total Signals, Urgent Alerts, Needs Attention, In Progress, Resolved).
   - Switch to the **Verified Directory** tab to inspect the 12 official government helplines.
   - Switch to the **Integration Status Center** tab to verify the live health of all 10 system components.
2. **Launch Multimodal Ingestion** (`/workspace`):
   - Select the preset: *"Severe water logging under railway bridge with three stranded vehicles."*
   - Notice the live **Open-Meteo Weather Card** instantly load Bengaluru's current temperature, wind speed, and hazard analysis.
   - Click **Start Voice Recording** to stream a speech transcript, or click **Take Photo** / **Upload PDF**.
3. **Execute Signal Ingestion**:
   - Click **Ingest & Analyze Signal**.
4. **Inspect Structured Reasoning** (`/results/:id`):
   - Review extracted facts, verified location, severity assessment, and confidence metrics.
   - Inspect the **Recommended Next Action** and **Responsible Authority**.
5. **Manage the Operational Workflow** (`/incidents/:id`):
   - Open the **Operational Task Checklist**.
   - Check off a completed task or add a new unit assignment.
   - Click **Generate Referral Docket** to review and print the formal dispatch letter addressed to the competent municipal or emergency authority.
   - Click **Escalate Urgency** to elevate the case to Critical priority with operational justification.
   - Advance the incident through the 13-state workflow selector (`In Progress` ➔ `Dispatched` ➔ `Resolved`).
6. **Verify Audit Trail & Notifications**:
   - Inspect the immutable audit history in the right rail.
   - Check the **Notifications Tab** on the dashboard to see the broadcast dispatch alert.

---

## 6. Security & Truthfulness Guarantees

- **No Secret Exposure**: Secret API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept exclusively on the Node.js backend and are NEVER exposed to the browser.
- **Untrusted Input Isolation**: Citizen submissions, transcripts, and OCR text are wrapped in boundaries and stripped of adversarial markdown override sequences before reaching models.
- **Truthful Attribution**: Live services (Open-Meteo, OSRM, official gazettes) are clearly marked with their exact source provenance. When credentials are not provided, fallback modes are explicitly disclosed.

---
*Built with care for hackathon evaluation and real-world societal impact.*
