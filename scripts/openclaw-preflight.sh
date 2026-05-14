#!/usr/bin/env bash
set -euo pipefail

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
  JSON_MODE=1
fi

REPO="${OPENCLAW_REPO:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$REPO"

JSON_MODE="$JSON_MODE" python3 - <<'PY'
import json
import os
import re
import subprocess
import sys
from pathlib import Path

json_mode = os.environ.get("JSON_MODE") == "1"
repo = Path.cwd()
failures = []
warnings = []

def run(cmd, check=False):
    result = subprocess.run(cmd, text=True, capture_output=True)
    if check and result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or f"command failed: {' '.join(cmd)}")
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def git(args):
    return run(["git", *args])

def add_fail(message):
    failures.append(message)

def add_warn(message):
    warnings.append(message)

def print_section(title):
    if not json_mode:
        print()
        print(f"===== {title} =====")

print_section("REPO")
branch = git(["branch", "--show-current"])[1]
status = git(["status", "--porcelain"])[1]
status_short_branch = git(["status", "--short", "--branch"])[1]

if not json_mode:
    print(f"repo={repo}")
    print(f"CURRENT_BRANCH={branch}")
    print(status_short_branch)

if branch != "main":
    add_fail(f"current branch is not main: {branch}")

if status:
    add_fail("working tree is not clean")

print_section("ORIGIN")
origin_url_rc, origin_url, _ = git(["remote", "get-url", "origin"])
origin_available = origin_url_rc == 0

origin_synced = None
if origin_available:
    fetch_rc, _, fetch_err = git(["fetch", "--quiet", "origin"])
    if fetch_rc != 0:
        add_warn(f"git fetch origin failed: {fetch_err}")
    else:
        _, local_main, _ = git(["rev-parse", "main"])
        _, remote_main, _ = git(["rev-parse", "origin/main"])
        if not json_mode:
            print(f"MAIN_COMMIT={local_main}")
            print(f"ORIGIN_MAIN_COMMIT={remote_main}")
        origin_synced = local_main == remote_main
        if not origin_synced:
            add_fail("main does not match origin/main")
else:
    add_warn("origin remote is not configured")

print_section("LOCKS")
locks_dir = repo / ".openclaw" / "locks"
active_locks = []
if locks_dir.exists():
    active_locks = sorted(str(p) for p in locks_dir.iterdir() if p.is_file())
else:
    add_warn(".openclaw/locks directory is missing")

if active_locks:
    add_fail("active lock files exist")
    if not json_mode:
        for lock in active_locks:
            print(f"ACTIVE_LOCK={lock}")

print_section("TASKS")
tasks_path = repo / "tasks.json"
done_ids = []
pending_count = 0

if not tasks_path.exists():
    add_fail("tasks.json not found")
else:
    try:
        data = json.loads(tasks_path.read_text(encoding="utf-8"))
        tasks = data.get("tasks", [])
        rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}

        done = {t.get("id") for t in tasks if t.get("status") == "done"}
        done_ids = [t.get("id") for t in tasks if t.get("status") == "done"]
        pending = [t for t in tasks if t.get("status") == "pending"]
        pending_count = len(pending)

        valid_count = 0
        for task in tasks:
            if task.get("status") != "pending":
                continue
            deps = task.get("dependencies", [])
            if all(dep in done for dep in deps):
                valid_count += 1

        if valid_count == 0:
            add_fail("no valid pending task with dependencies done")

        if not json_mode:
            print(f"DONE_COUNT={len(done_ids)}")
            print(f"PENDING_COUNT={pending_count}")
            print(f"VALID_PENDING_TASK_COUNT={valid_count}")
    except Exception as exc:
        add_fail(f"failed to parse tasks.json: {exc}")

print_section("DOCKER PREVIEW")
docker_override = repo / "docker-compose.override.yml"
docker_override_disabled = repo / "docker-compose.override.yml.disabled"
docker_preview_status = "absent"

if docker_override.exists():
    docker_preview_status = "active"
    add_warn("docker-compose.override.yml is active; Docker runtime may differ from repo defaults")
    ignored_rc, _, _ = git(["check-ignore", "-q", "docker-compose.override.yml"])
    if ignored_rc != 0:
        add_warn("docker-compose.override.yml is not ignored by git")
elif docker_override_disabled.exists():
    docker_preview_status = "disabled"

if not json_mode:
    print(f"DOCKER_PREVIEW_OVERRIDE={docker_preview_status}")

print_section("A2A WORKFLOW")
workflow = Path("/home/clawd/.openclaw/agents/manager/agent/A2A_WORKFLOW.md")
workflow_exists = workflow.exists()
if not workflow_exists:
    add_fail(f"manager A2A workflow file missing: {workflow}")
else:
    if not json_mode:
        print(f"A2A_WORKFLOW={workflow}")

result = "PASS" if not failures else "FAIL"

payload = {
    "result": result,
    "repo": str(repo),
    "currentBranch": branch,
    "workingTreeClean": not bool(status),
    "originAvailable": origin_available,
    "originSynced": origin_synced,
    "activeLocks": active_locks,
    "doneCount": len(done_ids),
    "pendingCount": pending_count,
    "dockerPreviewOverride": docker_preview_status,
    "warnings": warnings,
    "failures": failures,
}

if json_mode:
    print(json.dumps(payload, ensure_ascii=False, indent=2))
else:
    print_section("RESULT")
    print(f"PREFLIGHT_RESULT={result}")
    print(f"WARNING_COUNT={len(warnings)}")
    for item in warnings:
        print(f"WARN={item}")
    print(f"FAILURE_COUNT={len(failures)}")
    for item in failures:
        print(f"FAIL={item}")

sys.exit(0 if result == "PASS" else 1)
PY
