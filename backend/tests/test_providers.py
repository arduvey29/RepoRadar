import os
import pytest
from analyzer.synthesizer.providers import GroqProvider, GeminiProvider, OllamaProvider


@pytest.mark.asyncio
@pytest.mark.skipif(not os.getenv("GROQ_API_KEY"), reason="no GROQ_API_KEY")
async def test_groq_completes():
    text = await GroqProvider().complete("Reply with the single word OK and nothing else.")
    assert "OK" in text.upper()


@pytest.mark.asyncio
@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="no GEMINI_API_KEY")
async def test_gemini_completes():
    text = await GeminiProvider().complete("Reply with the single word OK and nothing else.")
    assert "OK" in text.upper()


@pytest.mark.asyncio
async def test_ollama_completes():
    p = OllamaProvider()
    if not await p.available():
        pytest.skip("Ollama not running")
    text = await p.complete("Reply with the single word OK and nothing else.")
    assert text.strip() != ""
