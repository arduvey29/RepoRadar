import asyncio, tempfile, shutil

async def clone_repo(repo_url: str) -> tuple[str, str]:
    if not repo_url.startswith("https://github.com/"):
        raise ValueError("Only public GitHub URLs are supported")
    parts = repo_url.rstrip("/").removesuffix(".git").split("/")
    repo_name = "/".join(parts[-2:])
    tmp_dir = tempfile.mkdtemp(prefix="reporadar_")
    proc = await asyncio.create_subprocess_exec(
        "git", "clone", "--depth=1", "--single-branch", repo_url, tmp_dir,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    try:
        _, err = await asyncio.wait_for(proc.communicate(), timeout=30)
    except asyncio.TimeoutError:
        proc.kill(); shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError("Clone timeout")
    if proc.returncode != 0:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError(f"Clone failed: {err.decode(errors='ignore')}")
    return tmp_dir, repo_name
