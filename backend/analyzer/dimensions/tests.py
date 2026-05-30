from models import DimensionResult

async def analyze(repo_path: str) -> DimensionResult:
    return DimensionResult(
        key="tests", name="Tests", score=7.0, grade="B",
        summary="(stub — real implementation pending)",
        findings=[], recommendations=[],
    )
