from radon.complexity import cc_visit
import os
from models import DimensionResult, Finding

def _grade(s): return "A" if s>=8.5 else "B" if s>=6.5 else "C" if s>=4.5 else "D" if s>=3 else "F"

async def analyze(repo_path: str) -> DimensionResult:
    complexities = []
    findings: list[Finding] = []
    for root, _, files in os.walk(repo_path):
        if any(p in root for p in [".git", "node_modules", ".venv", "venv"]): continue
        for f in files:
            if not f.endswith(".py"): continue
            full = os.path.join(root, f)
            try:
                src = open(full, encoding="utf-8", errors="ignore").read()
                for fn in cc_visit(src):
                    complexities.append(fn.complexity)
                    if fn.complexity > 15:
                        findings.append(Finding(category="high_complexity_file", severity="medium",
                                                detail=f"{os.path.relpath(full, repo_path)}::{fn.name} complexity={fn.complexity}"))
            except Exception: pass

    if not complexities:
        return DimensionResult(key="code_quality", name="Code Quality", score=7.0, grade="B",
                               summary="No Python files analyzed.", findings=[], recommendations=[])

    avg = sum(complexities) / len(complexities)
    score = 10.0 if avg < 5 else 8.0 if avg < 8 else 6.0 if avg < 12 else 4.0 if avg < 15 else 2.0
    return DimensionResult(key="code_quality", name="Code Quality", score=score, grade=_grade(score),
                           summary=f"Avg cyclomatic complexity {avg:.1f}.", findings=findings, recommendations=[])
