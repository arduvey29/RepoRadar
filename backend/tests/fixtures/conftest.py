"""Prevent pytest from collecting test files inside fixture repos.

Fixture directories contain sample repos used as inputs to dimension
analyzers; any ``test_*.py`` inside them is fixture data, not a real test.
"""
collect_ignore_glob = ["*/tests/*", "*/test_*.py", "*/*_test.py"]
