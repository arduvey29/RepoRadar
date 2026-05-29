import pytest
from analyzer.repo_cloner import clone_repo

@pytest.mark.asyncio
async def test_clone_rejects_non_github():
    with pytest.raises(ValueError):
        await clone_repo("https://gitlab.com/x/y")

@pytest.mark.asyncio
async def test_clone_parses_repo_name():
    path, name = await clone_repo("https://github.com/octocat/Hello-World")
    assert name == "octocat/Hello-World"
    import shutil; shutil.rmtree(path, ignore_errors=True)
