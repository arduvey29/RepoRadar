from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import httpx, os, uuid, asyncio, traceback
from datetime import datetime, timezone
from models import AnalyzeRequest, AnalyzeResponse, ReportResult
from report_store import store
from analyzer.repo_cloner import clone_repo
from analyzer.dimensions import code_quality, docs, deps, tests as tests_mod, ci, security
import shutil

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


def _overall_grade(score: float) -> str:
    return "A" if score >= 8.5 else "B" if score >= 6.5 else "C" if score >= 4.5 else "D" if score >= 3.0 else "F"

async def run_analysis(report_id: str, repo_url: str):
    repo_path = None
    try:
        repo_path, repo_name = await clone_repo(repo_url)
        dims = await asyncio.gather(
            code_quality.analyze(repo_path),
            docs.analyze(repo_path),
            deps.analyze(repo_path),
            tests_mod.analyze(repo_path),
            ci.analyze(repo_path),
            security.analyze(repo_path),
        )
        overall = sum(d.score for d in dims) / len(dims)
        report = ReportResult(
            report_id=report_id, repo_url=repo_url, repo_name=repo_name,
            overall_score=round(overall, 1), overall_grade=_overall_grade(overall),
            dimensions=list(dims),
            verdict="(verdict pending)",
            synthesis="(synthesis pending)",
            top_fixes=[],
            generated_at=datetime.now(timezone.utc).isoformat(),
            shareable_url=f"/report/{report_id}",
        )
        store.set_report(report_id, report)
    except Exception as e:
        traceback.print_exc()
        store.set_error(report_id, f"{type(e).__name__}: {e}" or "Unknown error")
    finally:
        if repo_path:
            shutil.rmtree(repo_path, ignore_errors=True)

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest, bg: BackgroundTasks):
    cached_id = store.lookup_url_cache(req.repo_url)
    cached = store.get(cached_id) if cached_id else None
    # Only short-circuit on a genuinely finished report — a still-processing
    # entry must fall through so the client gets a real report_id to poll.
    if cached and cached.get("status") == "complete" and cached.get("report"):
        return AnalyzeResponse(report_id=cached_id, status="complete", cached=True,
                               report=cached["report"])
    report_id = str(uuid.uuid4())
    store.set_status(report_id, "processing")
    store.cache_url(req.repo_url, report_id)
    bg.add_task(run_analysis, report_id, req.repo_url)
    return AnalyzeResponse(report_id=report_id, status="processing")

@app.get("/report/{report_id}", response_model=AnalyzeResponse)
async def get_report(report_id: str):
    entry = store.get(report_id)
    if not entry:
        raise HTTPException(404, "Report not found")
    return AnalyzeResponse(report_id=report_id, status=entry["status"],
                           report=entry.get("report"), error=entry.get("error"))
