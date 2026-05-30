from models import DimensionResult

async def analyze(repo_path: str) -> DimensionResult:
    return DimensionResult(
        key="security", name="Security", score=7.0, grade="B",
        summary="(stub — real implementation pending)",
        findings=[], recommendations=[],
    )
