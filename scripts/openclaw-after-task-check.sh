#!/usr/bin/env bash
set -euo pipefail

TASK_ID=""
JSON_MODE=0

for arg in "$@"; do
  case "$arg" in
    --json)
      JSON_MODE=1
      ;;
    TASK-*)
      TASK_ID="$arg"
      ;;
    *)
      if [ -z "$TASK_ID" ]; then
        TASK_ID="$arg"
      fi
      ;;
  esac
done

if [ -z "$TASK_ID" ]; then
  echo "Usage: $0 TASK-XXX [--json]"
  exit 2
fi

REPO="${OPENCLAW_REPO:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$REPO"

TASK_ID="$TASK_ID" JSON_MODE="$JSON_MODE" python3 - <<'PY'
import json
import os
import re
import subprocess
import sys
from pathlib import Path

task_id = os.environ["TASK_ID"]
json_mode = os.environ.get("JSON_MODE") == "1"
repo = Path.cwd()
failures = []
warnings = []

def run(cmd):
    return subprocess.run(cmd, text=True, capture_output=True)

def git(args):
    r = run(["git", *args])
    return r.returncode, r.stdout.strip(), r.stderr.strip()

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
origin_available = git(["remote", "get-url", "origin"])[0] == 0
origin_synced = None
main_commit = None
origin_main_commit = None

if origin_available:
    fetch = git(["fetch", "--quiet", "origin"])
    if fetch[0] != 0:
        add_warn(f"git fetch origin failed: {fetch[2]}")
    else:
        main_commit = git(["rev-parse", "main"])[1]
        origin_main_commit = git(["rev-parse", "origin/main"])[1]
        origin_synced = main_commit == origin_main_commit
        if not json_mode:
            print(f"MAIN_COMMIT={main_commit}")
            print(f"ORIGIN_MAIN_COMMIT={origin_main_commit}")
        if not origin_synced:
            add_fail("main does not match origin/main")
else:
    add_warn("origin remote is not configured")

print_section("TASK STATUS")
tasks_path = repo / "tasks.json"
task = None

if not tasks_path.exists():
    add_fail("tasks.json not found")
else:
    try:
        data = json.loads(tasks_path.read_text(encoding="utf-8"))
        tasks = data.get("tasks", [])
        task = next((t for t in tasks if t.get("id") == task_id), None)
        if not task:
            add_fail(f"{task_id} not found in tasks.json")
        else:
            if not json_mode:
                print(f"TASK_ID={task.get('id')}")
                print(f"TASK_STATUS={task.get('status')}")
                print(f"TASK_PRIORITY={task.get('priority')}")
                print(f"TASK_DESCRIPTION={task.get('description')}")
            if task.get("status") != "done":
                add_fail(f"{task_id} status is not done: {task.get('status')}")

    except Exception as exc:
        add_fail(f"failed to parse tasks.json: {exc}")

print_section("LOCKS")
locks_dir = repo / ".openclaw" / "locks"
active_locks = []
task_lock_exists = False

if locks_dir.exists():
    active_locks = sorted(str(p) for p in locks_dir.iterdir() if p.is_file())
    task_lock_exists = str(locks_dir / f"{task_id}.lock") in active_locks
else:
    add_warn(".openclaw/locks directory is missing")

if task_lock_exists:
    add_fail(f"task lock still exists: .openclaw/locks/{task_id}.lock")

if active_locks:
    add_fail("active lock files exist")
    if not json_mode:
        for lock in active_locks:
            print(f"ACTIVE_LOCK={lock}")

print_section("BRANCH / MERGE")
refs = []
for base in ["refs/heads", "refs/remotes/origin"]:
    rc, out, _ = git(["for-each-ref", "--format=%(refname:short)", base])
    if rc == 0 and out:
        refs.extend(out.splitlines())

matching_refs = [r for r in refs if re.search(rf"(^|/)task/{re.escape(task_id)}-", r)]
local_task_refs = [r for r in matching_refs if r.startswith(f"task/{task_id}-")]
remote_task_refs = [r for r in matching_refs if r.startswith(f"origin/task/{task_id}-")]

if not json_mode:
    for ref in matching_refs:
        print(f"TASK_REF={ref}")

if not matching_refs:
    add_fail(f"no local or remote task branch found for {task_id}")

selected_ref = local_task_refs[0] if local_task_refs else (remote_task_refs[0] if remote_task_refs else None)
task_branch_merged = None

if selected_ref:
    rc, _, _ = git(["merge-base", "--is-ancestor", selected_ref, "main"])
    task_branch_merged = rc == 0
    if not task_branch_merged:
        add_fail(f"{selected_ref} is not merged into main")

if not remote_task_refs:
    add_fail(f"no remote origin task branch found for {task_id}")

merge_rc, merge_out, _ = git(["log", "main", "--merges", "--format=%H %s", f"--grep={task_id}", "-n", "1"])
merge_commit = None
merge_subject = None

if merge_rc == 0 and merge_out:
    parts = merge_out.split(" ", 1)
    merge_commit = parts[0]
    merge_subject = parts[1] if len(parts) > 1 else ""
    if not json_mode:
        print(f"MERGE_COMMIT={merge_commit}")
        print(f"MERGE_SUBJECT={merge_subject}")
else:
    add_fail(f"merge commit containing {task_id} not found on main")

included_commits = []
if merge_commit:
    rc, out, _ = git(["log", "--oneline", "--reverse", f"{merge_commit}^1..{merge_commit}^2"])
    if rc == 0 and out:
        included_commits = out.splitlines()
        if not json_mode:
            for commit in included_commits:
                print(f"INCLUDED_COMMIT={commit}")
    if len(included_commits) < 3:
        add_warn("task branch contributed fewer than 3 commits")

result = "PASS" if not failures else "FAIL"

payload = {
    "result": result,
    "taskId": task_id,
    "repo": str(repo),
    "currentBranch": branch,
    "workingTreeClean": not bool(status),
    "originAvailable": origin_available,
    "originSynced": origin_synced,
    "mainCommit": main_commit,
    "originMainCommit": origin_main_commit,
    "taskStatus": None if not task else task.get("status"),
    "activeLocks": active_locks,
    "matchingTaskRefs": matching_refs,
    "selectedTaskRef": selected_ref,
    "taskBranchMerged": task_branch_merged,
    "mergeCommit": merge_commit,
    "mergeSubject": merge_subject,
    "includedCommits": included_commits,
    "warnings": warnings,
    "failures": failures,
}

if json_mode:
    print(json.dumps(payload, ensure_ascii=False, indent=2))
else:
    print_section("RESULT")
    print(f"AFTER_TASK_RESULT={result}")
    print(f"TASK_ID={task_id}")
    if merge_commit:
        print(f"MERGE_COMMIT={merge_commit}")
        print(f"WARNING_COUNT={len(warnings)}")
    for item in warnings:
        print(f"WARN={item}")
    print(f"FAILURE_COUNT={len(failures)}")
    for item in failures:
        print(f"FAIL={item}")

sys.exit(0 if result == "PASS" else 1)
PY
