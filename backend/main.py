from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx, os

app = FastAPI(title="RepoRadar API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

async def ollama_available() -> bool:
    try:
        async with httpx.AsyncClient(timeout=1.0) as c:
            r = await c.get(f"{OLLAMA_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "ollama_available": await ollama_available()}
