from .types import SynthesisResult
from models import DimensionResult


def _overall_phrase(overall: float) -> str:
    if overall >= 8.5:
        return "is in exemplary shape across the board"
    if overall >= 6.5:
        return "is solid with a few clear gaps"
    if overall >= 4.5:
        return "needs meaningful work in several areas"
    return "is in critical shape"


def _verdict(repo_name: str, dimensions: list[DimensionResult]) -> str:
    strengths = sorted([d for d in dimensions if d.score >= 7.5], key=lambda d: -d.score)[:2]
    weaknesses = sorted([d for d in dimensions if d.score < 5.0], key=lambda d: d.score)[:2]
    if strengths and weaknesses:
        s = " and ".join(d.name for d in strengths)
        w = " and ".join(d.name for d in weaknesses)
        return f"Strong {s}, dragged down by weak {w}."
    if strengths and not weaknesses:
        s = " and ".join(d.name for d in strengths)
        return f"Solid across the board, led by {s}."
    if weaknesses and not strengths:
        w = " and ".join(d.name for d in weaknesses)
        return f"Multiple gaps to address — {w} need the most attention."
    return "Mid-range scores across every dimension; pick one and improve it first."


def synthesize(repo_name: str, dimensions: list[DimensionResult], examples: list[dict]) -> SynthesisResult:
    overall = sum(d.score for d in dimensions) / len(dimensions)
    verdict = _verdict(repo_name, dimensions)

    p1 = f"{repo_name} {_overall_phrase(overall)}. Overall health scores {overall:.1f}/10 across six dimensions of static analysis."

    strengths = sorted([d for d in dimensions if d.score >= 7.5], key=lambda d: -d.score)[:2]
    if len(strengths) >= 2:
        a, b = strengths[0], strengths[1]
        p2 = f"On the strengths side, {a.name} ({a.score:.1f}/10) leads, followed by {b.name} ({b.score:.1f}/10)."
    elif strengths:
        d = strengths[0]
        p2 = f"On the strengths side, {d.name} ({d.score:.1f}/10) leads the way."
    else:
        p2 = "No dimension scores in the strong range, so improvements compound — every fix helps."

    high_findings = [f for d in dimensions for f in d.findings if f.severity == "high"][:3]
    by_cat = {e["category"]: e for e in examples}
    fragments = []
    for f in high_findings[:2]:
        e = by_cat.get(f.category)
        if e and "prose_fragment" in e:
            fragments.append(e["prose_fragment"])
    if fragments:
        p3 = "The most pressing priorities: this repo " + ", and ".join(fragments) + ". Address these first."
    else:
        p3 = "Pick the lowest-scoring dimension and start there."

    top_fixes = [by_cat[f.category]["recommendation"]
                 for f in high_findings
                 if f.category in by_cat and "recommendation" in by_cat[f.category]][:3]

    return SynthesisResult(verdict=verdict, text=f"{p1}\n\n{p2}\n\n{p3}", top_fixes=top_fixes)
