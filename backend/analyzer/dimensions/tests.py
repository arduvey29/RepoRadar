import os
from models import DimensionResult, Finding

def _grade(s): return "A" if s>=8.5 else "B" if s>=6.5 else "C" if s>=4.5 else "D" if s>=3 else "F"

SRC_EXT = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java"}
TEST_PATTERNS = ("test_", "_test.", ".test.", ".spec.")

async def analyze(repo_path: str) -> DimensionResult:
    test_files = 0
    source_files = 0
    for root, _, files in os.walk(repo_path):
        if any(p in root for p in [".git", "node_modules", ".venv", "venv", "dist", "build"]): continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext not in SRC_EXT: continue
            if any(p in f for p in TEST_PATTERNS): test_files += 1
            else: source_files += 1

    findings: list[Finding] = []
    if source_files == 0:
        return DimensionResult(key="tests", name="Tests", score=5.0, grade="C",
                               summary="No source files detected.", findings=[], recommendations=[])

    score = min(10.0, (test_files / source_files) * 20)
    if score < 6:
        findings.append(Finding(category="low_test_ratio", severity="high",
                                detail=f"{test_files} test files for {source_files} source files."))
    has_config = any(os.path.exists(os.path.join(repo_path, n)) for n in ("pytest.ini", "jest.config.js", "jest.config.ts"))
    if has_config:
        score = min(10.0, score + 1)
    else:
        findings.append(Finding(category="no_test_config", severity="low", detail="No pytest/jest config detected."))

    return DimensionResult(key="tests", name="Tests", score=round(score, 1), grade=_grade(score),
                           summary=f"{test_files} test files, {source_files} source files.",
                           findings=findings, recommendations=[])
