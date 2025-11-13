# AI-Enhanced-EHR-Imaging-Documentation-System



> Clinical Summarisation, MRI Insights & Patient History—powered by FastAPI, React and Hugging Face

---

## 📌 Overview

This project delivers an end‑to‑end medical analysis experience that blends structured EHR text, MRI imagery and ICD‑10 intelligence. Clinicians (or analysts acting as “Guest” users) can upload notes and scans, review AI‑generated findings, export polished PDFs, and persist every encounter to a database-backed patient timeline.

### Core capabilities
- **Clinical summarisation:** FastAPI orchestrates Hugging Face (or the local BART fallback) to produce rich, timestamped narratives.
- **MRI image insights:** AI captions and enhanced imagery accompany each report and are embedded into downloads.
- **ICD‑10 coding assistance:** Accurate suggestions arrive via the HF inference API, with a heuristic matcher on standby for offline use.
- **Patient record keeping:** SQLite + SQLAlchemy store demographics, ICD metadata, and running summary history for every saved report.
- **Operational dashboards:** The React frontend surfaces report history, patient rosters and management tools across dedicated views.

---

## 🧭 Project Structure

```
.
├── backend/
│   ├── healthcare_backend_app.py   # FastAPI service (patients, summaries, reports)
│   ├── healthcare_fastapi.db       # SQLite database (generated at runtime)
│   └── requirements.txt            # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # SPA router & save workflow
│   │   ├── components/             # Dashboards, report pages, patient management
│   │   └── services/api.ts         # REST clients for backend endpoints
│   ├── package.json
│   └── vite.config.ts
├── README.md                       # You are here
└── .gitignore
```

---

## 🧩 Architecture

| Layer        | Technology & Notes                                                                 |
|--------------|-------------------------------------------------------------------------------------|
| Frontend     | React 18 + Vite + TypeScript + Tailwind-inspired custom components                 |
| Backend      | FastAPI, SQLAlchemy ORM, SQLite (dev)                                              |
| AI Services  | Hugging Face text generation (configurable), Transformers local fallback, html2canvas/jsPDF for PDF assembly |
| Persistence  | `patients` & `reports` tables (auto-created); patient.extras tracks summary history |

**Workflow Highlights**
1. User enters clinical text and/or uploads an MRI image.
2. Frontend calls `POST /api/generate-summary` to obtain narrative + ICD suggestions.
3. “Save Report” posts the structured payload to `POST /api/report`, which:
   - Creates the report row.
  - Grows `patients.extra.summary_history` with the new timestamped summary.
  - Appends the latest summary to `patients.clinical_notes`.
4. Dashboards and Patient Management query `/api/reports` and `/api/patients`.
5. Downloads render a white‑label PDF with headers, summaries and enhanced imagery.

---

## 🚀 Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv/Scripts/activate  # or source venv/bin/activate
pip install -r requirements.txt

# Optional Hugging Face configuration
set HF_API_TOKEN=your_token_here            # Windows PowerShell
export HF_API_TOKEN=your_token_here         # macOS/Linux

uvicorn healthcare_backend_app:app --reload --port 7860
# API docs: http://localhost:7860/docs
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173

# Provide API URL (defaults to http://localhost:7860)
echo "VITE_API_BASE_URL=http://localhost:7860" > .env.local
```

---

## 🔐 Environment Variables

| Variable          | Purpose                                        |
|-------------------|------------------------------------------------|
| `HF_API_TOKEN`    | Enables hosted Hugging Face inference for ICD coding & summarisation |
| `HF_MODEL`        | Override default model used by `hf_inference` (default: `google/gemma-2-2b-it`) |
| `HF_ICD_MODEL`    | Optional dedicated model for ICD generation    |
| `ICD_CSV_PATH`    | CSV file with ICD codes/descriptions (default: `ICD10codes.csv`) |
| `EHR_CSV_PATH`    | Sample EHR CSV for enrichment (default: `Merged_EHR_Data.csv`) |
| `DB_PATH`         | SQLAlchemy connection string (default SQLite)  |
| `VITE_API_BASE_URL` | Frontend base URL for backend API           |

If `HF_API_TOKEN` is unset, the backend gracefully falls back to local heuristics for ICD suggestions and summarisation.

---

## 📡 API Endpoints (Backend)

```
POST   /api/generate-summary    -> run EHR + image analysis (returns text, ICD, image info)
POST   /api/report              -> persist a report (auto-updates patient history)
GET    /api/report/{uid}        -> fetch a single report
GET    /api/reports             -> list reports (filter by patient_uid or doctor_name)
DELETE /api/report/{uid}        -> remove a report

POST   /api/patient             -> create patient manually
GET    /api/patient/{uid}       -> fetch patient
PUT    /api/patient/{uid}       -> update demographics / notes
GET    /api/patients            -> list patients
DELETE /api/patient/{uid}       -> delete

GET    /api/patient-data/{id}   -> enrich from `Merged_EHR_Data.csv` (if present)
POST   /api/upload-image        -> base64 helper for MRI uploads
GET    /api/health              -> service health probe
```

**Report persistence workflow**
- Each save call records clinical summary, ICD metadata, findings, recommendations, image captions and the raw payload.
- `patients.extra.summary_history` keeps the most recent 50 entries, each tagged with ISO timestamp and report UID.
- `patients.clinical_notes` accumulates an audit-friendly running log (`[timestamp] summary text`).

---

## 💻 Frontend Highlights

- **Unified Report Page:** Displays AI findings, shows history sidebars, and exports PDF (white background, MediAI header, enhanced imaging).
- **New Dashboard:** Uploads notes/images, syncs patient records before hitting the summary API.
- **Patient Management:** Searchable table of saved reports with quick metrics for unique patients, totals and latest activity.
- **Medical Dashboard:** Provides high-level stats, patient roster, MRI analysis tools, and report listings from the database.

Saving is available even as a “Guest User”; named logins simply filter the history to that clinician.

---

## 🧪 Testing & Linting

```bash
# Backend (pytest, optional if you add tests)
pytest

# Frontend
npm run lint
npm run build
```

Automated suites aren’t bundled by default—add them under `backend/tests/` or `frontend/src/__tests__/` to match your workflow.

---

## 🗃 Data Persistence Details

- **Database:** SQLite (file: `backend/healthcare_fastapi.db`). Swap `DB_PATH` for PostgreSQL/MySQL if desired.
- **Schema:**
  - `patients`: `patient_uid`, demographics, clinical_notes, `extra` JSON (summary history, contact info, etc.).
  - `reports`: `report_uid`, `patient_uid`, ICD metadata, clinical summary, findings/recommendations, JSON payload snapshot.
- **History enrichment:** Every saved report updates both tables, ensuring longitudinal context for repeat visits.

---

## 🛣 Roadmap Concepts

- Role-based authentication & JWT protection.
- Export options beyond PDF (HL7/FHIR, CSV).
- Scheduled follow-up reminders based on ICD codes.
- Automatic anomaly detection for MRI uploads (integration with CV models).
- Replace SQLite with managed cloud DB for multi-user deployments.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/amazing-idea`
3. Commit: `git commit -m "Add amazing idea"`
4. Push: `git push origin feature/amazing-idea`
5. Open a Pull Request with context and screenshots/logs where relevant.

Issues or enhancement suggestions are welcome—file them with logs, steps to reproduce, and expected behaviour.

---

## 📜 License

This project was developed for educational & internship purposes. Adapt it freely for internal prototypes; review institutional policies before using with real PHI/PII.

---

## 📞 Contact

- Maintainer: Vishal Kumar  
- Email: vishalkumar9581919@.com  
- Stack: FastAPI · React · Hugging Face · SQLAlchemy





