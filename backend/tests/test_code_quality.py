import pytest
from analyzer.dimensions.code_quality import analyze

@pytest.mark.asyncio
async def test_simple_py_high_score():
    r = await analyze("tests/fixtures/repo_simple_py")
    assert r.score >= 8.0
    assert r.key == "code_quality"

@pytest.mark.asyncio
async def test_complex_py_low_score():
    r = await analyze("tests/fixtures/repo_complex_py")
    assert r.score <= 6.0
    assert any(f.category == "high_complexity_file" for f in r.findings)
