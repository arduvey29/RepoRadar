import pytest
from analyzer.dimensions.deps import analyze

@pytest.mark.asyncio
async def test_stale_deps_low_score():
    r = await analyze("tests/fixtures/repo_stale_deps")
    assert r.score <= 6.0
    assert any(f.category == "stale_dep" for f in r.findings)
    assert r.key == "deps"
