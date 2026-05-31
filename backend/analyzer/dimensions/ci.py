import os
from models import DimensionResult, Finding

def _grade(s): return "A" if s>=8.5 else "B" if s>=6.5 else "C" if s>=4.5 else "D" if s>=3 else "F"

def _has_workflow_yml(path: str) -> bool:
    return os.path.isdir(path) and any(f.lower().endswith((".yml", ".yaml")) for f in os.listdir(path))

def _makefile_has_test(path: str) -> bool:
    try:
        return "test" in open(path, encoding="utf-8", errors="ignore").read().lower()
    except OSError:
        return False

# (category, weight, predicate, relative path parts)
CHECKS = [
    ("github_workflows", 4.0, _has_workflow_yml, [".github", "workflows"]),
    ("dockerfile",       2.0, lambda p: True,    ["Dockerfile"]),
    ("docker_compose",   1.0, lambda p: True,    ["docker-compose.yml"]),
    ("env_example",      1.0, lambda p: True,    [".env.example"]),
    ("makefile",         1.0, _makefile_has_test, ["Makefile"]),
    ("precommit",        1.0, lambda p: True,    [".pre-commit-config.yaml"]),
]

async def analyze(repo_path: str) -> DimensionResult:
    score = 0.0
    findings: list[Finding] = []
    for cat, w, pred, parts in CHECKS:
        path = os.path.join(repo_path, *parts)
        if os.path.exists(path) and pred(path):
            score += w
        else:
            findings.append(Finding(category=f"no_{cat}", severity="low",
                                    detail=f"Missing {'/'.join(parts)}."))
    score = min(10.0, score)
    summary = ("Strong CI/CD." if score >= 8
               else "CI/CD partly in place." if score >= 5
               else "CI/CD largely missing.")
    return DimensionResult(key="ci", name="CI/CD", score=round(score, 1), grade=_grade(score),
                           summary=summary, findings=findings, recommendations=[])
