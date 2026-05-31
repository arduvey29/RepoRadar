from abc import ABC, abstractmethod
import os
import httpx


class ProviderError(Exception):
    pass


class Provider(ABC):
    timeout: int

    @abstractmethod
    async def available(self) -> bool: ...

    @abstractmethod
    async def complete(self, prompt: str) -> str: ...


class GroqProvider(Provider):
    def __init__(self, timeout: int = 6):
        self.timeout = timeout
        self.key = os.getenv("GROQ_API_KEY", "")
        self.model = "llama-3.3-70b-versatile"

    async def available(self) -> bool:
        return bool(self.key)

    async def complete(self, prompt: str) -> str:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=self.key)
        resp = await client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3,
        )
        return resp.choices[0].message.content or ""


class GeminiProvider(Provider):
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.key = os.getenv("GEMINI_API_KEY", "")
        self.model = "gemini-2.5-flash"

    async def available(self) -> bool:
        return bool(self.key)

    async def complete(self, prompt: str) -> str:
        import asyncio
        import google.generativeai as genai
        genai.configure(api_key=self.key)
        m = genai.GenerativeModel(self.model)
        resp = await asyncio.to_thread(m.generate_content, prompt)
        return resp.text or ""


class OllamaProvider(Provider):
    def __init__(self, timeout: int = 45):
        self.timeout = timeout
        self.url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

    async def available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=1.5) as c:
                r = await c.get(f"{self.url}/api/tags")
                return r.status_code == 200
        except Exception:
            return False

    async def complete(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=self.timeout) as c:
            r = await c.post(
                f"{self.url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
            )
            r.raise_for_status()
            return r.json().get("response", "")
