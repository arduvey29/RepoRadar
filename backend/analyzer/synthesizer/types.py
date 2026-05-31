from pydantic import BaseModel


class SynthesisResult(BaseModel):
    verdict: str
    text: str
    top_fixes: list[str]
