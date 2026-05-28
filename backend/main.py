from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import httpx, os, uuid, asyncio
from datetime import datetime, timezone
from models import AnalyzeRequest, AnalyzeResponse, ReportResult, DimensionResult
from report_store import store

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


def _build_mock_report(report_id: str, repo_url: str) -> ReportResult:
    return ReportResult(
        report_id=report_id, repo_url=repo_url, repo_name="vercel/next.js",
        overall_score=7.2, overall_grade="B",
        dimensions=[
            DimensionResult(key="code_quality", name="Code Quality", score=8.4, grade="B", summary="OK"),
            DimensionResult(key="docs", name="Docs", score=7.1, grade="B", summary="OK"),
            DimensionResult(key="deps", name="Dependencies", score=4.2, grade="C", summary="Stale"),
            DimensionResult(key="tests", name="Tests", score=3.1, grade="D", summary="Thin"),
            DimensionResult(key="ci", name="CI/CD", score=9.0, grade="A", summary="Strong"),
            DimensionResult(key="security", name="Security", score=6.6, grade="B", summary="OK"),
        ],
        verdict="Strong CI and code, dragged down by a thin test surface and aging dependencies.",
        synthesis="Mock synthesis.\n\nStrengths: CI.\n\nFix: tests.",
        top_fixes=["Add tests", "Refresh deps"],
        generated_at=datetime.now(timezone.utc).isoformat(),
        shareable_url=f"/report/{report_id}",
    )

async def _run_mock_analysis(report_id: str, repo_url: str):
    await asyncio.sleep(3)
    store.set_report(report_id, _build_mock_report(report_id, repo_url))

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
    bg.add_task(_run_mock_analysis, report_id, req.repo_url)
    return AnalyzeResponse(report_id=report_id, status="processing")

@app.get("/report/{report_id}", response_model=AnalyzeResponse)
async def get_report(report_id: str):
    entry = store.get(report_id)
    if not entry:
        raise HTTPException(404, "Report not found")
    return AnalyzeResponse(report_id=report_id, status=entry["status"],
                           report=entry.get("report"), error=entry.get("error"))
