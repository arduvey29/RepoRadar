from rag.retriever import lookup
from models import Finding

def test_lookup_returns_matches():
    findings = [Finding(category="no_readme", severity="high", detail="x"),
                Finding(category="stale_dep", severity="medium", detail="x")]
    result = lookup(findings, k=6)
    assert any(e["category"] == "no_readme" for e in result)
    assert any(e["category"] == "stale_dep" for e in result)

def test_lookup_sorts_by_severity():
    findings = [Finding(category="stale_dep", severity="medium", detail="x"),
                Finding(category="no_readme", severity="high", detail="x")]
    result = lookup(findings, k=6)
    assert result[0]["severity"] == "high"

def test_lookup_caps_at_k():
    findings = [Finding(category="no_readme", severity="high", detail="x")] * 10
    assert len(lookup(findings, k=3)) <= 3
