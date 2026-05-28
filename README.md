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
