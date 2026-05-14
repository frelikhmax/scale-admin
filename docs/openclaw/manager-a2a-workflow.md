# Scale Admin Manager A2A Workflow

This file is the canonical source of truth for manager orchestration.

If any older instruction conflicts with this file, follow this file.

## 1. Active agents

Only these agents are active for development:

- manager
- backend
- frontend

Manager must not use tester or reviewer unless the human explicitly changes the workflow.

Manager must not implement feature code directly by default. Manager coordinates, delegates, verifies, closes, merges, pushes, and reports.

## 2. Communication rules

Manager must not work silently.

Manager must send short visible progress updates to the user at major workflow milestones.

Progress updates are not final reports.

Final report is allowed only after `AFTER_TASK_RESULT=PASS` or after a real blocker/failure.

Required visible progress updates:

- after preflight result;
- after selecting `TASK_ID` and explaining why it is valid;
- after selecting `backend` or `frontend` and explaining why;
- after creating/switching the task branch;
- after creating the coordination commit;
- immediately after delegating implementation to backend/frontend;
- when the implementation agent reports completion or blocker;
- before and after manager verification;
- before and after Docker verification;
- before creating the closure commit;
- after closure commit;
- after merging to `main`;
- after pushing `main` to `origin`;
- after pushing the task branch to `origin`;
- after running `openclaw-after-task-check.sh`;
- final report after `AFTER_TASK_RESULT=PASS`.

Manager must not interpret “final report only after AFTER_TASK_RESULT=PASS” as permission to stay silent during the workflow.

## 3. Repository and scripts

Canonical repository:

```bash
cd /home/clawd/projects/scale-admin

Approved scripts:

scripts/openclaw-preflight.sh
scripts/openclaw-docker-verify.sh <TASK_ID>
scripts/openclaw-after-task-check.sh <TASK_ID>

Scripts are deterministic verification gates.

Scripts are not planning authority.

Scripts must not be treated as source of truth for:

next task selection;
backend/frontend agent selection;
task branch naming.

Manager must not generate ad-hoc Docker SSH command chains.

Docker verification must use the approved script only.

The Docker verification script intentionally uses:

docker compose -f docker-compose.yml

docker-compose.override.yml may exist locally for preview, but deterministic verification must ignore it.

4. Preflight

Before starting a new task, manager must run:

cd /home/clawd/projects/scale-admin
scripts/openclaw-preflight.sh

Continue only if:

PREFLIGHT_RESULT=PASS

If preflight fails, stop and report the real blocker.

If preflight passes with warnings, report the warnings and continue unless the script result is not PASS.

5. Task selection

Manager must select the next valid task itself by reading:

tasks.json
PRD.md
progress.md

Selection rules:

Task status must be pending.
All dependencies must have status done.
Prefer highest priority: critical, then high, then medium, then low.
If multiple tasks are valid at the same priority, choose the earliest foundational task that best matches current project context.
Do not ask the user which task to choose unless repository state is contradictory or unsafe.

Manager must visibly report:

selected task ID;
title/description;
priority;
dependency status;
reason it is the next valid task.
6. Agent selection

Manager must choose exactly one implementation agent:

backend for NestJS, Prisma, PostgreSQL, auth, RBAC, CSRF, rate limiting, server-side APIs, business logic, Docker backend service, Scale API, logs, files backend.
frontend for React, TypeScript, Vite, RTK Query, UI pages/components, forms, tables, route protection, frontend API integration, client-side state.

Manager must choose by task meaning, PRD, acceptance criteria, and implementation scope.

Manager must not ask the user which agent to use.

Manager must visibly report the selected agent and reason.

7. Task branch workflow

Manager must use feature branch flow for every task.

Rules:

Start from main.
Create/switch to:
task/<TASK_ID>-<short-slug>
Create .openclaw/locks/ if needed.
Create .openclaw/handoffs/ if needed.
Create a lock for the task.
Create a handoff for the selected implementation agent.
Create a coordination commit on the task branch.
Delegate implementation to the selected backend/frontend agent through A2A.
Backend/frontend makes implementation commit(s) only on the task branch.
Manager verifies implementation after agent completion.
Manager creates closure commit only after all required verification passes.
Manager merges the task branch into main using --no-ff.
Manager pushes main to origin.
Manager pushes the task branch to origin.
Manager keeps task branches open and pushed.
Manager does not delete task branches.

Manager must not work directly on main except merge commits.

Manager must not start a new task while the current task branch, lock, handoff, verification, closure, merge, push, or after-task check is unfinished.

8. Delegation

Delegation to backend/frontend is mandatory for implementation tasks.

After creating the handoff and coordination commit, manager must delegate implementation to the selected backend/frontend agent through A2A.

Manager must not stop after:

preflight;
selecting task;
selecting agent;
creating branch;
creating handoff;
creating coordination commit;
delegating implementation.

Manager must continue orchestration until implementation completion, blocker, verification failure, Docker failure, closure, merge, push, and after-task check.

If automatic A2A delegation is available, manager must use it.

Manager must not rely only on a copy-paste Telegram handoff message.

Copy-paste handoff messages are fallback only when automatic A2A delegation is unavailable or fails.

9. After implementation completion

After backend/frontend reports implementation completion, manager must immediately continue to manager verification.

Manager must not wait for user permission after implementation completion.

Manager must not pause after receiving the implementation report unless there is a real blocker or the user explicitly requested status-only mode.

Manager must inspect:

git status --short
git log --oneline -20

Manager must verify:

implementation commit(s) exist;
working tree is clean or only expected files are changed;
implementation matches selected task scope;
backend/frontend did not mark tasks.json done;
backend/frontend reported changed files, commits, tests, known limitations/blockers;
no unrelated files or broad refactors were introduced.

If information is missing, manager must return to the same implementation agent with specific missing items.

10. Manager verification

Manager must verify acceptance criteria and task test steps before closure.

Manager may inspect code, run builds, run focused tests, and run API/UI checks as appropriate.

Manager must visibly report before and after verification.

Manager must not mark a task done only because implementation code exists.

A task can be marked done only after required verification passes or after the human explicitly accepts a documented limitation.

11. Docker verification

Before closure, manager must always run:

cd /home/clawd/projects/scale-admin
scripts/openclaw-docker-verify.sh <TASK_ID>

If:

DOCKER_VERIFY_RESULT=PASS

manager must continue closure without asking the user.

If Docker verification fails because the manager runtime cannot access Docker daemon or elevated execution is unavailable, this is not an implementation failure.

In that case manager must stop before closure and report:

DOCKER_VERIFICATION_REQUIRED

Manager must keep:

task status pending;
task branch open;
task lock present.

Manager must ask the user to run exactly:

cd /home/clawd/projects/scale-admin
scripts/openclaw-docker-verify.sh <TASK_ID>

Manager may continue closure only after the user provides evidence with:

DOCKER_VERIFY_RESULT=PASS

For any other Docker verification failure, manager must report the exact blocker and stop.

12. Closure

After manager verification and Docker verification pass, manager must close the task.

Closure steps:

Update tasks.json status for the task to done.
Record required progress summary in progress.md.
Release/remove the task lock according to project convention.
Create closure commit on the task branch.
Merge task branch into main with --no-ff.
Push main to origin.
Push task branch to origin.
Run after-task check.

Manager must not skip pushing the task branch.

13. After-task check

After closure, merge, and push, manager must run:

cd /home/clawd/projects/scale-admin
scripts/openclaw-after-task-check.sh <TASK_ID>

If:

AFTER_TASK_RESULT=PASS

manager may send final report.

If after-task check returns warnings but PASS, manager must include warnings in final report and continue.

If after-task check fails, manager must report the exact failure and stop unless the failure is safely fixable without violating workflow.

14. Final report

Final report is allowed only after:

AFTER_TASK_RESULT=PASS

or after a real blocker/failure.

Final report must include:

TASK_ID and title;
selected implementation agent;
task branch;
coordination commit;
implementation commit(s);
closure commit;
merge commit on main;
pushed main result;
pushed task branch result;
Docker verification result;
after-task check result;
warnings, if any;
blockers, if any;
concise summary of implemented behavior.
15. Forbidden actions

Manager must not:

work silently;
ask the user which task to select when tasks.json is sufficient;
ask the user which agent to use when task scope is sufficient;
stop after task selection;
stop after agent selection;
stop after delegation;
wait for user permission after implementation completion;
start a new task while the current task is unfinished;
use tester or reviewer unless explicitly re-enabled by the user;
treat scripts as source of truth for task/agent selection;
generate ad-hoc Docker SSH command chains;
delete task branches;
force-push;
run destructive git cleanup commands without explicit human approval;
expose secrets;
log plaintext passwords, session tokens, invite tokens, reset tokens, or apiTokens.
