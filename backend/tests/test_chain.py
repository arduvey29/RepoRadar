import pytest
from analyzer.synthesizer.chain import synthesize_with_chain, _parse_llm_output
from analyzer.synthesizer.providers import Provider, ProviderError
from models import DimensionResult, Finding


def _dim(key="docs", name="Docs", score=7.0, findings=None):
    return DimensionResult(key=key, name=name, score=score, grade="B",
                           summary="x", findings=findings or [], recommendations=[])


class _OkProvider(Provider):
    def __init__(self, text: str):
        self.timeout = 5
        self._text = text
    async def available(self): return True
    async def complete(self, prompt): return self._text


class _FailProvider(Provider):
    def __init__(self):
        self.timeout = 5
    async def available(self): return True
    async def complete(self, prompt): raise ProviderError("boom")


class _UnavailableProvider(Provider):
    def __init__(self):
        self.timeout = 5
    async def available(self): return False
    async def complete(self, prompt): raise AssertionError("should not be called")


_GOOD_OUTPUT = """VERDICT: Strong CI, dragged down by sparse tests.

The repo is in solid shape overall, with strong CI/CD and clean module boundaries that make it easy to navigate.

Strengths cluster around CI: matrix workflows, Docker, and pre-commit are all in place and well-tuned.

The most pressing priority is test coverage. The headline e2e suite is solid, but unit coverage on internal packages is thin.

TOP_FIXES:
- Add per-package test configs and enforce 60% line coverage.
- Trim the webpack-config builder into stage modules so each stage can be unit-tested.
"""


@pytest.mark.asyncio
async def test_chain_returns_parsed_provider_output():
    dims = [_dim()]
    r = await synthesize_with_chain("foo/bar", dims, providers=[_OkProvider(_GOOD_OUTPUT)])
    assert r.verdict == "Strong CI, dragged down by sparse tests."
    assert "test coverage" in r.text
    assert "VERDICT:" not in r.text
    assert "TOP_FIXES:" not in r.text
    assert len(r.top_fixes) == 2
    assert r.top_fixes[0].startswith("Add per-package")


@pytest.mark.asyncio
async def test_chain_falls_through_to_templated():
    dims = [_dim(findings=[Finding(category="low_test_ratio", severity="high", detail="x")])]
    r = await synthesize_with_chain("foo/bar", dims, providers=[_FailProvider(), _UnavailableProvider()])
    # templated tier emits all three fields deterministically
    assert r.verdict
    assert r.text
    assert isinstance(r.top_fixes, list)


@pytest.mark.asyncio
async def test_chain_skips_unavailable_then_uses_next():
    dims = [_dim()]
    r = await synthesize_with_chain("foo/bar", dims,
                                    providers=[_UnavailableProvider(), _OkProvider(_GOOD_OUTPUT)])
    assert r.verdict.startswith("Strong CI")


def test_parse_extracts_verdict_text_and_fixes():
    parsed = _parse_llm_output(_GOOD_OUTPUT)
    assert parsed is not None
    verdict, text, fixes = parsed
    assert verdict == "Strong CI, dragged down by sparse tests."
    assert "test coverage" in text
    assert "VERDICT:" not in text
    assert "TOP_FIXES:" not in text
    assert len(fixes) == 2


def test_parse_returns_none_on_malformed_output():
    # No VERDICT tag, no TOP_FIXES tag → not parseable
    assert _parse_llm_output("just a wall of text without any tags at all here") is None
