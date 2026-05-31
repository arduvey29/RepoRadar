import json
from pathlib import Path
from models import Finding

_LIBRARY_PATH = Path(__file__).parent / "findings_library.json"
_SEV_ORDER = {"high": 0, "medium": 1, "low": 2}

def _load() -> list[dict]:
    return json.loads(_LIBRARY_PATH.read_text(encoding="utf-8"))

_CACHE: list[dict] | None = None
def _library() -> list[dict]:
    global _CACHE
    if _CACHE is None:
        _CACHE = _load()
    return _CACHE

def lookup(findings: list[Finding], k: int = 6) -> list[dict]:
    lib = _library()
    by_cat: dict[str, dict] = {e["category"]: e for e in lib}
    seen: set[str] = set()
    matched: list[dict] = []
    for f in sorted(findings, key=lambda x: _SEV_ORDER.get(x.severity, 3)):
        entry = by_cat.get(f.category)
        if entry and f.category not in seen:
            seen.add(f.category)
            matched.append(entry)
        if len(matched) >= k:
            break
    return matched
