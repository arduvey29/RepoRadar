# RepoRadar

AI-powered GitHub repository health analyzer. Paste a URL, get a scored report across 6 dimensions with LLM-synthesized recommendations.

Status: in development.

## Local development

**Backend** (Python 3.11, FastAPI):

```powershell
cd backend
python -m venv radar-venv
radar-venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (Vite + React + TypeScript):

```powershell
cd frontend
npm install
npm run dev
```

## Architecture

Static analysis across six dimensions → 4-tier synthesis chain (Groq → Gemini → Ollama → Templated) backed by a curated findings library.

See the design spec for details (local only, not committed).

## Deploy

### Backend → Railway

1. Connect the GitHub repo, point the service at `backend/`.
2. Railway auto-detects via Nixpacks (config in `backend/railway.json`); the start command is in `Procfile`.
3. Set env vars in the Railway dashboard:
   - `GROQ_API_KEY` (optional — chain falls back to Gemini → Ollama → Templated if missing)
   - `GEMINI_API_KEY` (optional)
   - `OLLAMA_URL` (optional — only set if you run a remote Ollama; otherwise omit and the chain skips it)
   - `FRONTEND_URL` — your Vercel domain, e.g. `https://reporadar.app`. Tightens CORS to that origin only.
   - `RATE_LIMIT_PER_MIN` (default `5`), `MAX_CONCURRENT_ANALYSES` (default `3`)

### Frontend → Vercel

1. Connect the GitHub repo, set the Root Directory to `frontend/`.
2. Build command: `npm run build`. Output dir: `dist`.
3. SPA rewrite is handled by `frontend/vercel.json`.
4. Env var:
   - `VITE_API_URL` — your Railway backend URL, e.g. `https://reporadar-backend.up.railway.app`.
