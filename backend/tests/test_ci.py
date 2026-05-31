import pytest
from analyzer.dimensions.ci import analyze

@pytest.mark.asyncio
async def test_ci_rich_scores_well():
    r = await analyze("tests/fixtures/repo_ci_rich")
    assert r.score >= 6.0
    assert r.key == "ci"

@pytest.mark.asyncio
async def test_ci_bare_scores_low():
    r = await analyze("tests/fixtures/repo_ci_bare")
    assert r.score < 4.0
    assert any(f.category == "no_github_workflows" for f in r.findings)
    assert any(f.category == "no_dockerfile" for f in r.findings)
