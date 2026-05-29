import pytest
from analyzer.dimensions.docs import analyze

@pytest.mark.asyncio
async def test_full_readme_high_score():
    r = await analyze("tests/fixtures/repo_with_full_readme")
    assert r.score >= 8.0
    assert r.key == "docs"

@pytest.mark.asyncio
async def test_no_readme_low_score():
    r = await analyze("tests/fixtures/repo_no_readme")
    assert r.score <= 3.0
    assert any(f.category == "no_readme" for f in r.findings)
