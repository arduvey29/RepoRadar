from pydantic import BaseModel
from typing import Optional, Literal

Severity = Literal["high", "medium", "low"]
DimensionKey = Literal["code_quality", "docs", "deps", "tests", "ci", "security"]


class Finding(BaseModel):
    category: str
    severity: Severity
    detail: str


class DimensionResult(BaseModel):
    key: DimensionKey
    name: str
    score: float
    grade: str
    summary: str
    findings: list[Finding] = []
    recommendations: list[str] = []


class ReportResult(BaseModel):
    report_id: str
    repo_url: str
    repo_name: str
    overall_score: float
    overall_grade: str
    dimensions: list[DimensionResult]
    verdict: str
    synthesis: str
    top_fixes: list[str]
    generated_at: str
    shareable_url: str


class AnalyzeRequest(BaseModel):
    repo_url: str


class AnalyzeResponse(BaseModel):
    report_id: str
    status: Literal["processing", "complete", "error", "queued"]
    cached: bool = False
    report: Optional[ReportResult] = None
    error: Optional[str] = None
