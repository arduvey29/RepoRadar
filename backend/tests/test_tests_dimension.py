import pytest
from analyzer.dimensions.tests import analyze

@pytest.mark.asyncio
async def test_well_tested_high_score():
    r = await analyze("tests/fixtures/repo_well_tested")
    assert r.score >= 8.0
    assert r.key == "tests"

@pytest.mark.asyncio
async def test_no_tests_low_score_and_finding():
    r = await analyze("tests/fixtures/repo_no_tests")
    assert r.score < 6.0
    assert any(f.category == "low_test_ratio" for f in r.findings)
