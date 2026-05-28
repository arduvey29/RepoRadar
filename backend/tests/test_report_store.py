import pytest
from datetime import datetime, timedelta
from report_store import ReportStore, normalize_url


def test_normalize_url():
    assert normalize_url("https://github.com/foo/Bar/") == "https://github.com/foo/bar"
    assert normalize_url("https://github.com/foo/bar.git") == "https://github.com/foo/bar"
    assert normalize_url("https://github.com/foo/bar?x=1") == "https://github.com/foo/bar"


def test_cache_hit_within_ttl():
    s = ReportStore(ttl_hours=24)
    s.cache_url("https://github.com/foo/bar", "abc-123")
    assert s.lookup_url_cache("https://github.com/foo/bar") == "abc-123"


def test_cache_expires():
    s = ReportStore(ttl_hours=0)
    s.cache_url("https://github.com/foo/bar", "abc-123")
    assert s.lookup_url_cache("https://github.com/foo/bar") is None
