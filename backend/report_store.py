from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, urlunparse
from typing import Optional


def normalize_url(url: str) -> str:
    p = urlparse(url.strip().lower())
    path = p.path.rstrip("/")
    if path.endswith(".git"):
        path = path[:-4]
    return urlunparse((p.scheme, p.netloc, path, "", "", ""))


class ReportStore:
    def __init__(self, ttl_hours: int = 24):
        self._reports: dict = {}
        self._url_cache: dict[str, tuple[str, datetime]] = {}
        self._ttl = timedelta(hours=ttl_hours)

    def set_status(self, report_id: str, status: str):
        self._reports[report_id] = {"status": status}

    def set_report(self, report_id: str, report):
        self._reports[report_id] = {"status": "complete", "report": report}

    def set_error(self, report_id: str, error: str):
        self._reports[report_id] = {"status": "error", "error": error}

    def get(self, report_id: str):
        return self._reports.get(report_id)

    def cache_url(self, url: str, report_id: str):
        self._url_cache[normalize_url(url)] = (
            report_id,
            datetime.now(timezone.utc) + self._ttl,
        )

    def lookup_url_cache(self, url: str) -> Optional[str]:
        key = normalize_url(url)
        entry = self._url_cache.get(key)
        if not entry:
            return None
        report_id, expires = entry
        if datetime.now(timezone.utc) > expires:
            del self._url_cache[key]
            return None
        return report_id


store = ReportStore()
