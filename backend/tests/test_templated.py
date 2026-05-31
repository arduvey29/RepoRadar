import pytest
from models import DimensionResult, Finding
from analyzer.synthesizer.templated import synthesize

def _dim(key, score, findings=None):
    return DimensionResult(key=key, name=key.title(), score=score, grade="B",
                           summary="x", findings=findings or [], recommendations=[])

def test_templated_returns_three_paragraphs():
    dims = [
        _dim("docs", 8.5),
        _dim("ci", 9.0),
        _dim("tests", 3.0, [Finding(category="low_test_ratio", severity="high", detail="x")]),
    ]
    r = synthesize("foo/bar", dims, examples=[])
    assert r.text.count("\n\n") >= 2

def test_templated_includes_top_fixes():
    dims = [_dim("tests", 3.0, [Finding(category="low_test_ratio", severity="high", detail="x")])]
    examples = [{"category": "low_test_ratio", "recommendation": "Add tests."}]
    r = synthesize("foo/bar", dims, examples=examples)
    assert "Add tests." in r.top_fixes

def test_templated_verdict_is_short_sentence():
    dims = [_dim("docs", 9.0), _dim("ci", 9.0), _dim("tests", 3.0)]
    r = synthesize("foo/bar", dims, examples=[])
    # verdict should be a single short headline — not the full synthesis
    assert 0 < len(r.verdict) < 240
    assert "\n" not in r.verdict
    assert r.verdict.endswith(".")
