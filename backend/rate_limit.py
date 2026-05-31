import os
import asyncio
from slowapi import Limiter
from slowapi.util import get_remote_address

PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "5"))
MAX_CONCURRENT = int(os.getenv("MAX_CONCURRENT_ANALYSES", "3"))

limiter = Limiter(key_func=get_remote_address)
analysis_semaphore = asyncio.Semaphore(MAX_CONCURRENT)
