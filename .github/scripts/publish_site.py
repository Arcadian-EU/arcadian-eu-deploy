#!/usr/bin/env python3
"""Promote a checked main commit and wait for that exact deployed commit."""
import json
import os
from pathlib import Path
import re
import subprocess
import time
from urllib.error import URLError
from urllib.request import Request, urlopen

MIRROR = "https://github.com/Arcadian-EU/arcadian-eu-deploy.git"
DEPLOYMENT_URL = "https://arcadian-eu.com/deployment.json"


def git(*args):
    return subprocess.check_output(["git", *args], text=True, stderr=subprocess.PIPE).strip()


def remote_head(remote):
    refs = git("ls-remote", "--heads", remote, "refs/heads/main").splitlines()
    if len(refs) != 1:
        raise RuntimeError("Publication requires an existing main branch.")
    return refs[0].split()[0]


def validate_context(environ):
    required = {
        "GITHUB_SERVER_URL": "https://arcadian-spzoo.ghe.com",
        "GITHUB_REPOSITORY": "Arcadian-EU/arcadian-eu-deploy",
        "GITHUB_REF": "refs/heads/main",
    }
    if any(environ.get(key) != value for key, value in required.items()):
        raise RuntimeError("Only corporate main may publish the mirror.")
    if environ.get("GITHUB_EVENT_NAME") not in {"push", "workflow_dispatch"}:
        raise RuntimeError("This event may not publish the mirror.")


def promote(expected, source="origin", mirror=MIRROR):
    if not re.fullmatch(r"[0-9a-f]{40}", expected) or git("rev-parse", "HEAD") != expected:
        raise RuntimeError("Checkout does not match the checked commit.")
    if remote_head(source) != expected:
        print("A newer corporate main exists; skipping this superseded run.", flush=True)
        return False
    git("fetch", "--no-tags", mirror, "refs/heads/main")
    previous = git("rev-parse", "FETCH_HEAD")
    if subprocess.run(["git", "merge-base", "--is-ancestor", previous, expected], check=False).returncode:
        raise RuntimeError("Mirror history diverged; refusing to overwrite it.")
    # No force, branch deletion, tag publication or independent mirror commits.
    git("push", mirror, f"{expected}:refs/heads/main")
    if remote_head(mirror) != expected:
        raise RuntimeError("Mirror main does not match the checked commit.")
    return True


def wait_for_deployment(expected, url=DEPLOYMENT_URL, timeout=900, interval=20):
    deadline = time.monotonic() + timeout
    last = "unavailable"
    while time.monotonic() < deadline:
        try:
            request = Request(f"{url}?commit={expected}", headers={"Cache-Control": "no-cache"})
            with urlopen(request, timeout=15) as response:
                observed = json.load(response).get("commit")
            if observed == expected:
                return
            last = observed or "missing commit"
        except (URLError, ValueError, TimeoutError) as error:
            last = type(error).__name__
        time.sleep(min(interval, max(0, deadline - time.monotonic())))
    raise RuntimeError(f"Expected commit was not served within {timeout}s (last: {last}). Check the publication workflow.")


def main():
    validate_context(os.environ)
    expected = os.environ["GITHUB_SHA"]
    if not promote(expected):
        return
    print(f"Mirror updated to {expected}; waiting for DigitalOcean.", flush=True)
    wait_for_deployment(expected)
    if remote_head(MIRROR) != expected:
        raise RuntimeError("Mirror changed during publication.")
    print(f"Published and served: {expected}", flush=True)
    if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
        with Path(summary).open("a") as output:
            output.write(f"Published corporate commit `{expected}`.\n\n[Live deployment marker]({DEPLOYMENT_URL})\n")


if __name__ == "__main__":
    main()
