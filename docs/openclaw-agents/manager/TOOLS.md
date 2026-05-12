
TOOLS.md — Manager Terminal Notes

Project repo:

cd ~/projects/scale-admin

Shared docs:

ls -la PRD.md tasks.json progress.md

Useful status commands:

git status --short
git log --oneline -20
find .openclaw -maxdepth 3 -type f | sort

Inspect pending tasks:

python3 - <<'PY'
import json
from pathlib import Path

data = json.loads(Path("tasks.json").read_text())
tasks = data["tasks"]
done = {t["id"] for t in tasks if t.get("status") == "done"}

priority_rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}
ready = []
blocked = []

for t in tasks:
    if t.get("status") != "pending":
        continue
    missing = [d for d in t.get("dependencies", []) if d not in done]
    row = (priority_rank.get(t.get("priority"), 99), t["id"], t["priority"], t["description"], missing)
    if missing:
        blocked.append(row)
    else:
        ready.append(row)

print("READY:")
for _, tid, prio, desc, _ in sorted(ready):
    print(f"- {tid} [{prio}] {desc}")

print("\nBLOCKED:")
for _, tid, prio, desc, missing in sorted(blocked):
    print(f"- {tid} [{prio}] blocked by {', '.join(missing)} — {desc}")
PY

Create a handoff:

mkdir -p .openclaw/handoffs .openclaw/locks

Validate JSON after editing tasks.json:

python3 -m json.tool tasks.json >/tmp/tasks.validated.json && echo "tasks.json OK"

Do not run destructive git commands without human approval:

git reset --hard
git clean -fd
git push --force
deleting branches
deleting migrations
deleting data volumes
