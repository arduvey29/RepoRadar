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
        raise RuntimeError("Clone timed out — the repo is too large to audit in the allotted window.")
    if result.returncode != 0:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        stderr = result.stderr.decode(errors="ignore").lower()
        if "could not resolve host" in stderr or "name or service not known" in stderr:
            raise RuntimeError("Could not reach github.com. Check your network.")
        if "repository not found" in stderr or "not found" in stderr or "404" in stderr:
            raise RuntimeError("Repository not found — is the URL correct and the repo public?")
        if "authentication" in stderr or "permission denied" in stderr:
            raise RuntimeError("Repository requires authentication. Only public repos are supported.")
        raise RuntimeError("Could not clone the repository. Double-check the URL.")
    return tmp_dir, repo_name
