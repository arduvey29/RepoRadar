import asyncio
import re
from .types import SynthesisResult
from . import templated, prompt_builder
from .providers import Provider
from rag.retriever import lookup as rag_lookup
from models import DimensionResult

MIN_OUTPUT_LEN = 80
_VERDICT_RE = re.compile(r"VERDICT:\s*(.+?)(?:\n\s*\n|\Z)", re.DOTALL)
_FIXES_RE = re.compile(r"TOP_FIXES:\s*\n(.+)\Z", re.DOTALL)
_BULLET_RE = re.compile(r"^\s*(?:[-*]|\d+[.)])\s+(.+)$")


def _parse_llm_output(raw: str) -> tuple[str, str, list[str]] | None:
    if not raw or not raw.strip():
        return None

    v_match = _VERDICT_RE.search(raw)
    f_match = _FIXES_RE.search(raw)
    if not v_match or not f_match:
        return None

    verdict = " ".join(v_match.group(1).split()).strip()
    fixes_block = f_match.group(1)
    fixes: list[str] = []
    for line in fixes_block.splitlines():
        m = _BULLET_RE.match(line)
        if m:
            fix = m.group(1).strip()
            if fix:
                fixes.append(fix)

    body = raw[:v_match.start()] + raw[v_match.end():f_match.start()]
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    if not verdict or not body or not fixes:
        return None
    return verdict, body, fixes


async def synthesize_with_chain(repo_name: str, dimensions: list[DimensionResult],
                                providers: list[Provider]) -> SynthesisResult:
    findings = [f for d in dimensions for f in d.findings]
    examples = rag_lookup(findings, k=6)
    prompt = prompt_builder.build(repo_name, dimensions, examples)

    for p in providers:
        try:
            if not await p.available():
                continue
            raw = await asyncio.wait_for(p.complete(prompt), timeout=p.timeout)
        except Exception:
            continue
        if not raw or len(raw.strip()) < MIN_OUTPUT_LEN:
            continue
        parsed = _parse_llm_output(raw)
        if parsed is None:
            continue
        verdict, text, fixes = parsed
        return SynthesisResult(verdict=verdict, text=text, top_fixes=fixes[:3])

    return templated.synthesize(repo_name, dimensions, examples)
