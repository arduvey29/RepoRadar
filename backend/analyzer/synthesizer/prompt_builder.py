from models import DimensionResult


def build(repo_name: str, dimensions: list[DimensionResult], examples: list[dict]) -> str:
    dims_summary = "\n".join(
        f"- {d.name}: {d.score}/10 — {d.summary}" for d in dimensions
    )
    examples_block = "\n".join(
        f"- {e['category']}: {e['recommendation']}" for e in examples
    ) or "(no curated examples matched)"

    return f"""You are a senior engineering reviewer for {repo_name}.

Scores:
{dims_summary}

Use these proven recommendations as inspiration (don't quote verbatim):
{examples_block}

Respond in this exact format (the tags VERDICT: and TOP_FIXES: must appear on their own lines):

VERDICT: <one sentence, max 25 words, naming strongest and weakest dimensions>

<paragraph 1: overall assessment>

<paragraph 2: top 2 strengths with evidence>

<paragraph 3: top 2 priorities with specific next steps>

TOP_FIXES:
- <first concrete fix, imperative>
- <second concrete fix, imperative>

Direct. No preamble. No "In conclusion." Sound like a senior engineer doing code review, not a marketing report."""
