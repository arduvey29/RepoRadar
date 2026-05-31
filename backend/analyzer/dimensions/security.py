import os, re, sys, subprocess, json, asyncio
from models import DimensionResult, Finding

def _grade(s): return "A" if s>=8.5 else "B" if s>=6.5 else "C" if s>=4.5 else "D" if s>=3 else "F"

SECRET_PATTERNS = [
    (re.compile(r"""(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"\n]{4,}"""), "hardcoded_secret"),
    (re.compile(r"""(?i)(api[_-]?key|apikey)\s*=\s*['\"][^'\"\n]{8,}"""), "hardcoded_secret"),
    (re.compile(r"\beval\s*\("), "eval_usage"),
    (re.compile(r"\.innerHTML\s*="), "innerhtml_assign"),
]
SCAN_EXTS = {".py", ".js", ".jsx", ".ts", ".tsx", ".env"}
SKIP_DIRS = (".git", "node_modules", ".venv", "venv", "radar-venv")

def _run_bandit(repo_path: str) -> dict:
    try:
        r = subprocess.run(
            [sys.executable, "-m", "bandit", "-r", repo_path, "-f", "json", "-q"],
            capture_output=True, text=True, timeout=30,
        )
        return json.loads(r.stdout or "{}")
    except Exception:
        return {}

async def analyze(repo_path: str) -> DimensionResult:
    findings: list[Finding] = []
    crit = 0
    med = 0

    data = await asyncio.to_thread(_run_bandit, repo_path)
    for issue in data.get("results", []):
        sev = (issue.get("issue_severity") or "").lower()
        if sev == "high":
            crit += 1
            cat = "bandit_critical"
            severity = "high"
        elif sev == "medium":
            med += 1
            cat = "bandit_medium"
            severity = "medium"
        else:
            continue
        rel = os.path.relpath(issue.get("filename", ""), repo_path)
        findings.append(Finding(category=cat, severity=severity,
                                detail=f"{issue.get('issue_text','')} ({rel})"))

    for root, _, files in os.walk(repo_path):
        if any(p in root for p in SKIP_DIRS): continue
        for f in files:
            if os.path.splitext(f)[1].lower() not in SCAN_EXTS: continue
            full = os.path.join(root, f)
            try:
                src = open(full, encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            for pat, cat in SECRET_PATTERNS:
                if pat.search(src):
                    sev = "high" if cat == "hardcoded_secret" else "medium"
                    if sev == "high": crit += 1
                    else: med += 1
                    findings.append(Finding(category=cat, severity=sev,
                                            detail=f"Pattern {cat} matched in {os.path.relpath(full, repo_path)}"))

    score = max(0.0, 10.0 - crit * 3 - med * 1)
    summary = "Clean." if score >= 8 else "Some concerns." if score >= 5 else "Multiple issues."
    return DimensionResult(key="security", name="Security", score=round(score, 1), grade=_grade(score),
                           summary=summary, findings=findings, recommendations=[])
