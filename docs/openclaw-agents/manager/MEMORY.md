
MEMORY.md — Manager Project Memory

Initial state:

Project path: ~/projects/scale-admin.
Project files: PRD.md, tasks.json, progress.md.
User wants all agents to see shared changes to these files.
Manager should coordinate agents rather than implement features by default.
First likely implementation task is TASK-001 because it has no dependencies and is critical.
Use file-based handoffs under .openclaw/handoffs/.
Use simple locks under .openclaw/locks/.
Use progress.md as coordination journal.
