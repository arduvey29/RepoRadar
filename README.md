# RepoRadar

AI-powered GitHub repository health analyzer. Paste a public GitHub URL, get a scored report across 6 dimensions with LLM-synthesized recommendations and actionable fixes.

## What it analyzes

| Dimension | What it checks |
|---|---|
| **Code Quality** | Cyclomatic complexity, maintainability index (radon) |
| **Documentation** | README presence, length, badges, contributing guide |
| **Dependencies** | Outdated packages, unpinned versions (PyPI) |
| **Tests** | Test file ratio, coverage indicators |
| **CI/CD** | GitHub Actions / CI config presence and structure |
| **Security** | Known vulnerability patterns, secrets, unsafe calls (bandit) |

Each dimension scores 0–10. An LLM synthesis chain (Groq → Gemini → Ollama → Templated fallback) writes a verdict, three-paragraph summary, and top fixes.

---

## Local setup

### Prerequisites

- Python 3.13+
- Node.js 18+
- Git (must be on your PATH)

---

### 1. Backend

```powershell
cd backend
python -m venv radar-venv
radar-venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### Environment variables (optional)

Create a `.env` file inside `backend/` (or set them in your shell). All are optional — the chain falls back gracefully if keys are missing.

```env
# LLM providers — add whichever you have
GROQ_API_KEY=gsk_...          # fastest (6 s timeout) — get free key at console.groq.com
GEMINI_API_KEY=AIza...        # fallback (10 s timeout) — get free key at aistudio.google.com

# Ollama (local, runs last in chain — 45 s timeout)
# Leave unset if you don't run Ollama locally
OLLAMA_URL=http://localhost:11434

# Tuning (defaults shown)
RATE_LIMIT_PER_MIN=5
MAX_CONCURRENT_ANALYSES=3
```

> If no API keys are set, the system uses the **Templated fallback** — fully deterministic output generated from the scores, no LLM required. Everything still works.

#### Start the backend

```powershell
radar-venv\Scripts\uvicorn.exe main:app --reload --port 8000
```

API is now live at `http://localhost:8000`. Health check: `http://localhost:8000/healthz`

---

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App is now at `http://localhost:5173`.

#### Frontend env (optional)

If your backend runs on a different port, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

---

### 3. Ollama (optional — for local LLM)

If you want the Ollama tier of the synthesis chain:

```powershell
# Install from https://ollama.com, then pull a model
ollama pull mistral-nemo
```

The backend auto-warms Ollama on startup. Any model works — smaller is faster; `llama3.1:8b` or `mistral-nemo:12b` recommended.

---

## Architecture

```
Browser
  └─ POST /analyze ──────────────────────────────────────► FastAPI
                                                              │
                                              git clone (shallow, temp dir)
                                                              │
                                        asyncio.gather ── 6 analyzers in parallel
                                                              │
                                              ┌─── SSE events ──► /report/{id}/stream
                                              │                        │
                                        synthesize                 Browser
                                      (4-tier chain)            (radar fills live)
                                      Groq → Gemini
                                      → Ollama → Templated
                                              │
                                        store report
                                              │
                                     GET /report/{id} ◄── Browser navigates
```

Six analyzers run in parallel. As each finishes it emits an SSE event — the radar chart in the browser fills spoke by spoke at real analysis speed, not a fake timer.

The synthesis chain validates LLM output against a structured schema (`VERDICT:` + 3 paragraphs + `TOP_FIXES:` list). A provider is rejected and the chain falls through if the model ignores the format.

---

## Running tests

```powershell
# Backend
cd backend
radar-venv\Scripts\Activate.ps1
pytest -v

# Frontend
cd frontend
npm test
```
