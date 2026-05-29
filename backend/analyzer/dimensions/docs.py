import os, re
from models import DimensionResult, Finding

def _grade(score: float) -> str:
    return "A" if score >= 8.5 else "B" if score >= 6.5 else "C" if score >= 4.5 else "D" if score >= 3.0 else "F"

async def analyze(repo_path: str) -> DimensionResult:
    findings: list[Finding] = []
    score = 0.0
    readme_path = next((os.path.join(repo_path, n) for n in ("README.md", "README.rst", "README.txt", "README") if os.path.exists(os.path.join(repo_path, n))), None)

    if not readme_path:
        findings.append(Finding(category="no_readme", severity="high", detail="No README file at the repo root."))
    else:
        score += 2.0
        text = open(readme_path, encoding="utf-8", errors="ignore").read()
        wc = len(text.split())
        if wc > 500: score += 2.0
        else: findings.append(Finding(category="short_readme", severity="medium", detail=f"README is only {wc} words; aim for >500."))

        sections = {
            "install": r"##\s+install", "usage": r"##\s+(usage|example)",
            "architecture": r"##\s+(architecture|design)", "contributing": r"##\s+contribut",
        }
        weights = {"install": 1.5, "usage": 1.5, "architecture": 1.0, "contributing": 1.0}
        for k, pat in sections.items():
            if re.search(pat, text, re.IGNORECASE): score += weights[k]
            else: findings.append(Finding(category=f"missing_{k}_section", severity="low", detail=f"No {k} section in README."))

    if any(os.path.exists(os.path.join(repo_path, n)) for n in ("LICENSE", "LICENSE.md", "LICENSE.txt")):
        score += 1.0
    else:
        findings.append(Finding(category="no_license", severity="medium", detail="No LICENSE file found."))

    score = min(10.0, score)
    summary = (
        "Comprehensive README and license." if score >= 8.5 else
        "Solid docs with room to grow." if score >= 6.5 else
        "Docs need attention." if score >= 4.5 else
        "Critical docs gaps."
    )
    return DimensionResult(key="docs", name="Docs", score=round(score, 1), grade=_grade(score),
                           summary=summary, findings=findings, recommendations=[])
