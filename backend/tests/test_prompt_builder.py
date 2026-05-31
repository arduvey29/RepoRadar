from models import DimensionResult
from analyzer.synthesizer.prompt_builder import build


def _dim(key, name, score):
    return DimensionResult(key=key, name=name, score=score, grade="B",
                           summary=f"{name} summary.", findings=[], recommendations=[])


def test_prompt_contains_repo_and_scores():
    dims = [_dim("docs", "Docs", 8.0), _dim("tests", "Tests", 3.0)]
    out = build("foo/bar", dims, examples=[])
    assert "foo/bar" in out
    assert "Docs: 8.0/10" in out
    assert "Tests: 3.0/10" in out


def test_prompt_includes_each_example_category():
    dims = [_dim("docs", "Docs", 8.0)]
    examples = [
        {"category": "no_readme", "recommendation": "Add a README."},
        {"category": "stale_dep", "recommendation": "Bump deps."},
    ]
    out = build("foo/bar", dims, examples)
    assert "no_readme" in out
    assert "stale_dep" in out
    assert "Add a README." in out
    assert "Bump deps." in out


def test_prompt_demands_structured_format():
    dims = [_dim("docs", "Docs", 8.0)]
    out = build("foo/bar", dims, examples=[])
    assert "VERDICT:" in out
    assert "TOP_FIXES:" in out


def test_prompt_handles_empty_examples():
    dims = [_dim("docs", "Docs", 8.0)]
    out = build("foo/bar", dims, examples=[])
    assert "no curated examples matched" in out
