# SutrAI — Production Deployment & Operations Guide

**Application:** SutrAI (Societal-Benefit Multimodal Triage, Emergency Routing & Action Platform)  
**Tagline:** *“Every signal has a next step.”*  
**Architecture:** Decoupled Full-Stack Web Application (React + Vite Frontend, Express + Node.js Backend, Supabase PostgreSQL, Google Gemini 3.8 Flash SDK)

---

## 🏗️ System Architecture Overview

```
                      +---------------------------------------+
                      |       Client Browser / Mobile         |
                      |   React 18 + Vite + Tailwind CSS      |
                      +-------------------+-------------------+
                                          |
                      HTTPS REST API (CORS Restricted)
                                          |
                                          v
                      +---------------------------------------+
                      |         Node.js Express Server        |
                      |  - Helmet Security Headers            |
                      |  - Rate Limiting (10 req/min analyze) |
                      |  - Multer 25MB Upload Guard           |
                      |  - Prompt Injection Sanitizer         |
                      |  - Cryptographic SHA-256 Chainer      |
                      +-------+-----------------------+-------+
                              |                       |
               +--------------+                       +---------------+
               v                                                      v
+-------------------------------+                     +-------------------------------+
|     Google Gemini API         |                     |     Supabase Cloud Database   |
|   @google/genai SDK           |                     |   PostgreSQL + Row-Level      |
|   gemini-3.8-flash            |                     |   Security (RLS)              |
+-------------------------------+                     +-------------------------------+
               |                                                      |
               v                                                      v
+-------------------------------+                     +-------------------------------+
|     Open-Meteo Weather API    |                     |     OSRM Road Routing Engine  |
|   Live Severe Hazard WMO      |                     |   Distance & ETA Calculation  |
+-------------------------------+                     +-------------------------------+
```

---

## ⚙️ Environment Variables Reference

Create a production `.env` file on your server (or configure via cloud provider dashboard). **Never commit `.env` to source control.**

```bash
# Server Port & Runtime
PORT=5001
NODE_ENV=production

# Frontend Origin for CORS (e.g., your Vercel domain)
CLIENT_URL=https://sutrai.vercel.app

# Google Gemini AI API Configuration
# Get your API key at: https://aistudio.google.com/
GEMINI_API_KEY=AIzaSy...your-production-gemini-key
GEMINI_MODEL=gemini-3.8-flash

# Supabase PostgreSQL Configuration
# Found in Project Settings > API on https://supabase.com
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...your-service-role-key

# Rate Limiting & Safety
MAX_UPLOAD_SIZE_MB=25
MAX_FILES_PER_REQUEST=5
```

---

## 🚀 Deployment Options

### Option A: Monolithic / Unified Container (Docker)

Use the production Dockerfile to containerize both backend and client bundle into a single scalable service:

```dockerfile
# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Production Server ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/server ./server
COPY --from=frontend-builder /app/src/types ./src/types
COPY --from=frontend-builder /app/src/utils ./src/utils
COPY tsconfig.server.json ./
RUN npx tsc -p tsconfig.server.json

EXPOSE 5001
CMD ["node", "dist-server/index.js"]
```

Build and run:
```bash
docker build -t sutrai-platform:latest .
docker run -p 5001:5001 --env-file .env sutrai-platform:latest
```

---

### Option B: Separate Frontend (Vercel) + Backend (Render / Cloud Run)

#### 1. Deploy Frontend to Vercel
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Root Directory: `./`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add `vercel.json` rewrites for SPA routing:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://sutrai-backend.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 2. Deploy Backend to Render / Railway / GCP Cloud Run
1. Create a **Web Service** pointing to the repository.
2. Runtime: **Node.js (Node 20+)**.
3. Build Command: `npm ci && npx tsc -p tsconfig.server.json`.
4. Start Command: `node dist-server/index.js`.
5. Environment Variables:
   - `PORT=5001`
   - `GEMINI_API_KEY=...`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_KEY=...`
   - `CLIENT_URL=https://sutrai.vercel.app`

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the database migration found in `/supabase/migrations/20261023_init_sutrai.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  urgency TEXT NOT NULL DEFAULT 'moderate',
  summary TEXT NOT NULL,
  reported_location JSONB NOT NULL,
  affected_parties TEXT,
  original_submission JSONB NOT NULL,
  analysis JSONB NOT NULL,
  operator_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  audit_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  referrals JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo_data BOOLEAN NOT NULL DEFAULT false,
  audit_chain_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read of demo data and public incidents
CREATE POLICY "Public read policy" ON incidents
  FOR SELECT USING (true);

-- Allow authenticated or service key insert/update
CREATE POLICY "Service write policy" ON incidents
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 🛡️ Production Security Checklist

| Check | Implemented Control | Verification Command |
|---|---|---|
| **Rate Limiting** | 10 requests / minute on `/api/analyze`; 120 req/min general | `curl -i http://localhost:5001/api/analyze` |
| **HTTP Security Headers** | `helmet` middleware setting strict Content-Security-Policy & anti-sniffing | Inspect `curl -sI http://localhost:5001/api/health` |
| **File Upload Bounds** | Multer memory storage capped at 25 MB max per file, 5 files max | Verified in `tests/server.test.ts` |
| **File MIME Validation** | Strict whitelist: JPEG, PNG, WebP, MP3, WAV, WebM, MP4, PDF, TXT, CSV | Rejects `.exe`, `.sh`, `.php` with 400 |
| **Prompt Injection Defense** | Input sanitizer escapes Markdown backticks and overrides | Verified in `sanitizeUntrustedInput` unit test |
| **Zero Secret Disclosure** | Server health checks (`/api/integrations/status`) reveal zero API keys | Verified in `tests/server.test.ts` |
| **Mandatory Consent** | Missing or false `sensitiveConsent` strictly returns HTTP 400 | Verified in `tests/server.test.ts` |
| **Cryptographic Integrity** | SHA-256 hash chaining on all audit events with genesis anchor | Verified in `verifyAuditChain` test suite |

---

## 🩺 Post-Deployment Health Verification

After deploying, run the following health checks:

1. **Ping API Health:**
   ```bash
   curl -s https://your-backend-domain.com/api/health
   # Expected: {"status":"ok","service":"SutrAI Core API","version":"2.0.0"}
   ```

2. **Verify Integration Status:**
   ```bash
   curl -s https://your-backend-domain.com/api/integrations/status | jq .
   # Expected: JSON object with integrations status and capabilities
   ```

3. **Verify Frontend Bundle:**
   ```bash
   curl -sI https://your-frontend-domain.com | head -n 5
   # Expected: HTTP/2 200 OK
   ```
