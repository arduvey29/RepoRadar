import asyncio, tempfile, shutil, subprocess

async def clone_repo(repo_url: str) -> tuple[str, str]:
    if not repo_url.startswith("https://github.com/"):
        raise ValueError("Only public GitHub URLs are supported")
    parts = repo_url.rstrip("/").removesuffix(".git").split("/")
    repo_name = "/".join(parts[-2:])
    tmp_dir = tempfile.mkdtemp(prefix="reporadar_")
    try:
        result = await asyncio.to_thread(
            subprocess.run,
            ["git", "clone", "--depth=1", "--single-branch", repo_url, tmp_dir],
            capture_output=True, timeout=30,
        )
    except subprocess.TimeoutExpired:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError("Clone timeout")
    if result.returncode != 0:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError(f"Clone failed: {result.stderr.decode(errors='ignore')}")
    return tmp_dir, repo_name
