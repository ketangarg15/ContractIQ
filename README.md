# ContractIQ

AI-powered contract intelligence platform — upload a contract and get structured risk analysis, clause extraction, obligation tracking, compliance checks, negotiation suggestions, and a citation-grounded chat assistant, all backed by an LLM pipeline with strict JSON-schema outputs.

The platform ships as a **FastAPI backend** (`main.py`) with a **Next.js frontend** (`frontend/`). A legacy single-file **Streamlit prototype** (`app.py`) is also included in the repo for reference but is not the actively developed interface — use the FastAPI + Next.js stack described below.

---

## Features

- **Contract upload** — PDF and DOCX, parsed and chunked for retrieval
- **Structured analysis pipeline** — every stage returns schema-validated JSON (Pydantic), not free-form text:
  - Contract type classification
  - Narrative summary + key points (Term, Payment, Liability, etc.)
  - Exhaustive clause-by-clause extraction, categorized (Term & Renewal, Payment, Liability, Indemnification, Confidentiality, Termination, IP & Ownership, Dispute Resolution, General)
  - Risk analysis with a composite 0–100 score, derived from and consistent with identified red flags
  - Red flag detection (severity-ranked: Low / Medium / High / Critical)
  - Obligation & deadline tracking, with recurring obligations collapsed into single entries
  - Named entity recognition (parties, dates, monetary amounts, jurisdictions, durations, etc.)
  - Compliance checks against GDPR, HIPAA, and PCI DSS — applicability determined from contract text, not assumed
  - AI negotiation suggestions (current vs. suggested wording, prioritized, prioritized against identified red flags)
- **Live analysis progress** — the `/analyze` endpoint streams pipeline stage updates via Server-Sent Events
- **RAG-powered chat** — ask questions about a specific contract, answered strictly from retrieved contract context with inline `[Source N]` citations
- **Semantic search** — FAISS-backed similarity search over contract chunks
- **Contract comparison** — clause-by-clause diff between two uploaded contracts (Added / Removed / Modified / Unchanged)
- **Clause library** — save clauses from any analyzed contract into a searchable, filterable cross-contract library
- **Executive dashboard** — risk distribution, clause frequency, and a summary table across all analyzed contracts
- **PDF and DOCX report export** — full analysis bundle or a redline-style negotiation report
- **User accounts** — registration/login with role support (Counsel / Admin), contracts scoped per user

---

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (SQLite by default)
- Groq API (LLM inference, JSON-mode structured output)
- `sentence-transformers` + FAISS (embeddings & vector search)
- PyMuPDF / `python-docx` (document parsing)
- `fpdf2` / `python-docx` (report export)

**Frontend**
- Next.js 16 (App Router) + React 18 + TypeScript
- Tailwind CSS 4
- Recharts (dashboard charts)
- `react-dropzone` (file upload)
- `sonner` (toasts)
- `lucide-react` (icons)

---

## Project Structure

```
ContractIQ-main/
├── main.py                    # FastAPI application — all API routes
├── app.py                     # Legacy Streamlit prototype (not actively maintained)
├── requirements.txt           # Python dependencies
├── database/
│   └── contracts.db           # SQLite database (created/used at runtime)
├── models/
│   └── prompts.py             # All LLM prompt templates, centralized
├── schemas/
│   └── contract_schemas.py    # Pydantic models for every structured LLM output
├── services/
│   ├── llm_client.py          # LLM client, retry logic, JSON-mode dispatch
│   ├── embeddings.py          # Embedding model loading + generation
│   ├── vector_store.py        # Per-contract FAISS index build/load/search
│   ├── parser.py              # PDF/DOCX text extraction
│   ├── chunker.py             # Text chunking for retrieval
│   ├── chatbot.py             # RAG chat with citation grounding
│   ├── contract_classifier.py
│   ├── summarizer.py
│   ├── clause_extractor.py
│   ├── risk_analyzer.py
│   ├── red_flag_detector.py
│   ├── obligation_tracker.py
│   ├── ner_extractor.py
│   ├── compliance_checker.py
│   ├── negotiation.py
│   ├── contract_compare.py
│   ├── clause_library.py
│   ├── clause_recommender.py
│   ├── analytics.py
│   ├── history.py             # Contract + user database models/queries
│   ├── pdf_exporter.py
│   ├── docx_exporter.py
│   └── agents/                # Thin agent wrappers around the services above
├── utils/
│   └── pdf_utils.py
└── frontend/
    ├── src/
    │   ├── app/                # Next.js pages: login, upload, dashboard, summary,
    │   │                        # clause-analysis, compliance, comparison,
    │   │                        # template-comparison, search, knowledge
    │   ├── components/          # Dashboard widgets, layout, shared UI
    │   ├── context/             # ContractContext (app-wide contract state)
    │   ├── lib/api.ts            # API client — all backend calls
    │   ├── data/mockData.ts      # Mock data used during frontend-only development
    │   └── types/index.ts       # Shared TypeScript types
    └── package.json
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 20+** and npm
- A **Groq API key** — get one at [console.groq.com](https://console.groq.com)

---

## Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/ketangarg15/ContractIQ
cd ContractIQ-main
```

### 2. Backend setup

Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the FastAPI backend:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

On first run, the backend will automatically:
- Initialize the SQLite database (`database/contracts.db`)
- Create `uploads/`, `contract_texts/`, and the FAISS vector store directory

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. First use

1. Open `http://localhost:3000` — you'll be redirected to `/login`.
2. Register a new account (role: Counsel or Admin).
3. Upload a contract (PDF or DOCX) from the Upload page.
4. Watch the analysis pipeline run in real time, then explore the Summary, Clause Analysis, Compliance, Comparison, Search, and Dashboard pages.

---

## Environment Variables

### Backend (`.env` in project root)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | API key for Groq LLM inference. All structured analysis, chat, and negotiation generation depends on this. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No (defaults to `http://localhost:8000`) | Base URL the frontend uses to reach the FastAPI backend. |

---

## API Overview

Full interactive documentation is available at `/docs` once the backend is running. Key endpoint groups:

| Group | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Contracts** | `POST /api/contracts/upload`, `GET /api/contracts/{id}/analyze` (SSE stream), `GET /api/contracts`, `GET /api/contracts/{id}`, `DELETE /api/contracts/{id}`, `PATCH /api/contracts/{id}/status` |
| **Chat & Search** | `POST /api/contracts/{id}/chat`, `POST /api/contracts/{id}/search` |
| **Compare** | `POST /api/contracts/compare` |
| **Clause Library** | `GET /api/clauses/library`, `POST /api/clauses/library`, `DELETE /api/clauses/library/{id}` |
| **Dashboard** | `GET /api/dashboard/stats` |
| **Export** | `GET /api/contracts/{id}/pdf`, `GET /api/contracts/{id}/docx` |

Authenticated requests are scoped per user via an `X-Username` header, set automatically by the frontend after login.

---

## Notes on the Analysis Pipeline

The `/api/contracts/{id}/analyze` endpoint runs stages **in a fixed order**, not in parallel, because later stages depend on earlier ones for consistency:

1. Classification
2. Summary
3. Clause extraction
4. **Red flag detection** — runs before risk analysis and negotiation by design
5. Risk analysis (uses red flag results as context, so the composite score and category severities stay consistent with identified red flags)
6. Obligation tracking
7. Entity recognition
8. Compliance check
9. Negotiation suggestions (also uses red flag results, to prioritize suggestions toward already-identified issues)
10. Persist the full structured bundle to the database

Progress for each stage streams to the frontend via Server-Sent Events, so the UI can show live pipeline status rather than a single spinner.

---

## Known Limitations

- `app.py` (Streamlit) is an earlier, single-file prototype kept for reference. It is not wired to the same database schema or pipeline ordering as the FastAPI backend and should not be used for active development.
- The embedding model (`all-MiniLM-L6-v2`, via `sentence-transformers`) is general-purpose, not legal-domain-specific. Swapping it for a legal-domain embedding model is a known area for future improvement.
- Authentication uses a simple username/header scheme, not token-based sessions (e.g. JWT) — suitable for local/internal use, not hardened for public deployment as-is.
- LLM calls depend on Groq's API and its rate limits; heavy iterative testing can exhaust daily token quotas on free-tier usage.

---
