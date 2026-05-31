import pytest
from analyzer.dimensions.security import analyze

@pytest.mark.asyncio
async def test_eval_usage_flagged():
    r = await analyze("tests/fixtures/repo_with_eval")
    assert r.score <= 7.0
    assert r.key == "security"
    assert any(f.category == "eval_usage" for f in r.findings)

@pytest.mark.asyncio
async def test_clean_repo_high_score():
    r = await analyze("tests/fixtures/repo_clean")
    assert r.score >= 9.0
    assert all(f.severity != "high" for f in r.findings)
