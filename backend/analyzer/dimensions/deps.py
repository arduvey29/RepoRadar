import os, httpx, asyncio, re
from datetime import datetime, timezone
from models import DimensionResult, Finding

def _grade(s): return "A" if s>=8.5 else "B" if s>=6.5 else "C" if s>=4.5 else "D" if s>=3 else "F"

async def _fetch_pypi_latest(client: httpx.AsyncClient, pkg: str):
    try:
        r = await client.get(f"https://pypi.org/pypi/{pkg}/json", timeout=4.0)
        if r.status_code == 200:
            return pkg, r.json()
    except Exception:
        pass
    return None

async def analyze(repo_path: str) -> DimensionResult:
    req_file = os.path.join(repo_path, "requirements.txt")
    findings: list[Finding] = []
    if not os.path.exists(req_file):
        return DimensionResult(key="deps", name="Dependencies", score=7.0, grade="B",
                               summary="No requirements.txt detected.", findings=[], recommendations=[])

    deps_listed = []
    for line in open(req_file, encoding="utf-8", errors="ignore"):
        line = line.strip()
        if not line or line.startswith("#"): continue
        m = re.match(r"^([A-Za-z0-9_.\-]+)\s*(==|>=|~=)?\s*([\w.\-]+)?", line)
        if m: deps_listed.append((m.group(1), m.group(3) or ""))

    if not deps_listed:
        return DimensionResult(key="deps", name="Dependencies", score=7.0, grade="B",
                               summary="No parseable deps.", findings=[], recommendations=[])

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[_fetch_pypi_latest(client, p) for p, _ in deps_listed])

    now = datetime.now(timezone.utc)
    fresh = 0
    total = 0
    for (pkg, pinned), result in zip(deps_listed, results):
        if not result:
            continue
        _, data = result
        total += 1
        latest_version = data.get("info", {}).get("version")
        # Prefer the pinned version's upload time so old pins are detected as stale.
        # Fall back to the latest version if the pin isn't published.
        all_releases = data.get("releases", {})
        target_version = pinned if pinned and all_releases.get(pinned) else latest_version
        releases = all_releases.get(target_version) or []
        upload = releases[0].get("upload_time_iso_8601") or releases[0].get("upload_time") if releases else None
        if not upload:
            continue
        # Normalize to tz-aware UTC. PyPI returns ISO 8601 with timezone in upload_time_iso_8601,
        # and a naive string in upload_time (treat as UTC).
        try:
            uploaded = datetime.fromisoformat(upload.replace("Z", "+00:00"))
            if uploaded.tzinfo is None:
                uploaded = uploaded.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        months_old = (now - uploaded).days / 30
        if months_old <= 6:
            fresh += 1
        else:
            pin_label = f"{pkg}=={target_version}" if target_version else pkg
            findings.append(Finding(category="stale_dep", severity="medium",
                                    detail=f"{pin_label} released {months_old:.0f} months ago"))

    score = (fresh / total) * 10 if total else 7.0
    return DimensionResult(key="deps", name="Dependencies", score=round(score, 1), grade=_grade(score),
                           summary=f"{fresh}/{total} dependencies fresh (<6mo).",
                           findings=findings, recommendations=[])
