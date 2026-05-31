from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from sse_starlette.sse import EventSourceResponse
import json
import httpx, os, uuid, asyncio, traceback
from datetime import datetime, timezone
from models import AnalyzeRequest, AnalyzeResponse, ReportResult
from report_store import store
from analyzer.repo_cloner import clone_repo
from analyzer.dimensions import code_quality, docs, deps, tests as tests_mod, ci, security
from analyzer.synthesizer.chain import synthesize_with_chain
from analyzer.synthesizer.providers import GroqProvider, GeminiProvider, OllamaProvider
from share.og_image import render as render_og
from share.badge_svg import render_badge
from rate_limit import limiter, analysis_semaphore, PER_MIN
import shutil

app = FastAPI(title="RepoRadar API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
PROVIDERS = [GroqProvider(), GeminiProvider(), OllamaProvider()]


@app.on_event("startup")
async def warmup_ollama():
    ollama = next((p for p in PROVIDERS if isinstance(p, OllamaProvider)), None)
    if ollama and await ollama.available():
        # Fire-and-forget so the first user request isn't cold.
        asyncio.create_task(ollama.complete("ping"))

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


_PROGRESS_QUEUES: dict[str, asyncio.Queue] = {}


def _emit(report_id: str, event: dict):
    q = _PROGRESS_QUEUES.get(report_id)
    if q is not None:
        q.put_nowait(event)


async def _run_dim(report_id: str, key: str, coro):
    result = await coro
    _emit(report_id, {"type": "dimension", "key": key, "score": result.score})
    return result


async def run_analysis(report_id: str, repo_url: str):
    repo_path = None
    try:
        async with analysis_semaphore:
            repo_path, repo_name = await clone_repo(repo_url)
            dims = await asyncio.gather(
                _run_dim(report_id, "code_quality", code_quality.analyze(repo_path)),
                _run_dim(report_id, "docs", docs.analyze(repo_path)),
                _run_dim(report_id, "deps", deps.analyze(repo_path)),
                _run_dim(report_id, "tests", tests_mod.analyze(repo_path)),
                _run_dim(report_id, "ci", ci.analyze(repo_path)),
                _run_dim(report_id, "security", security.analyze(repo_path)),
            )
            synth = await synthesize_with_chain(repo_name, list(dims), PROVIDERS)
            overall = sum(d.score for d in dims) / len(dims)
            report = ReportResult(
                report_id=report_id, repo_url=repo_url, repo_name=repo_name,
                overall_score=round(overall, 1), overall_grade=_overall_grade(overall),
                dimensions=list(dims),
                verdict=synth.verdict,
                synthesis=synth.text,
                top_fixes=synth.top_fixes,
                generated_at=datetime.now(timezone.utc).isoformat(),
                shareable_url=f"/report/{report_id}",
            )
            store.set_report(report_id, report)
        _emit(report_id, {"type": "complete", "report_id": report_id})
    except Exception as e:
        traceback.print_exc()
        msg = f"{type(e).__name__}: {e}" or "Unknown error"
        store.set_error(report_id, msg)
        _emit(report_id, {"type": "error", "error": msg})
    finally:
        if repo_path:
            shutil.rmtree(repo_path, ignore_errors=True)

@app.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit(f"{PER_MIN}/minute")
async def analyze(request: Request, req: AnalyzeRequest, bg: BackgroundTasks,
                  force: bool = Query(False)):
    if not force:
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
    # Create the SSE queue eagerly so dimension events aren't dropped if the
    # client opens the stream a tick after submitting.
    _PROGRESS_QUEUES.setdefault(report_id, asyncio.Queue())
    bg.add_task(run_analysis, report_id, req.repo_url)
    return AnalyzeResponse(report_id=report_id, status="processing")

@app.get("/report/{report_id}", response_model=AnalyzeResponse)
async def get_report(report_id: str):
    entry = store.get(report_id)
    if not entry:
        raise HTTPException(404, "Report not found")
    return AnalyzeResponse(report_id=report_id, status=entry["status"],
                           report=entry.get("report"), error=entry.get("error"))


@app.get("/report/{report_id}/stream")
async def stream(report_id: str):
    q = _PROGRESS_QUEUES.setdefault(report_id, asyncio.Queue())

    async def gen():
        try:
            while True:
                event = await q.get()
                yield {"data": json.dumps(event)}
                if event.get("type") in ("complete", "error"):
                    break
        finally:
            _PROGRESS_QUEUES.pop(report_id, None)

    return EventSourceResponse(gen())


_OG_CACHE: dict[str, bytes] = {}


@app.get("/og/{report_id}.png")
async def og_image(report_id: str):
    entry = store.get(report_id)
    if not entry or not entry.get("report"):
        raise HTTPException(404, "Report not found")
    if report_id not in _OG_CACHE:
        _OG_CACHE[report_id] = render_og(entry["report"])
    return Response(content=_OG_CACHE[report_id], media_type="image/png",
                    headers={"Cache-Control": "public, max-age=86400"})


@app.get("/badge/{report_id}.svg")
async def badge(report_id: str):
    entry = store.get(report_id)
    if not entry or not entry.get("report"):
        raise HTTPException(404, "Report not found")
    svg = render_badge(entry["report"])
    return Response(content=svg, media_type="image/svg+xml",
                    headers={"Cache-Control": "public, max-age=3600"})
