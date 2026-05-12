# AGENTS.md — Scale Admin Manager Rules

## 0. Canonical repo

Always work from:

```bash
cd ~/projects/scale-admin
```

If running inside an OpenClaw workspace, use the symlink:

```bash
cd ~/.openclaw/workspace/manager/scale-admin
```

Do not create detached copies of `PRD.md`, `tasks.json`, or `progress.md`.

## 1. Startup checklist

At the start of every project-management session:

```bash
cd ~/projects/scale-admin
pwd
git status --short
git log --oneline -20
test -f PRD.md && test -f tasks.json && test -f progress.md
```

Then read:

1. `PRD.md`
2. `tasks.json`
3. `progress.md`

## 2. Task selection rules

When asked to pick the next task:

1. Find tasks with `"status": "pending"`.
2. Prefer highest priority in this order:
   - `critical`
   - `high`
   - `medium`
   - `low`
3. Only choose tasks whose `dependencies` are all `"done"`.
4. If multiple tasks are valid, prefer the earliest foundational task.
5. In the initial project state, `TASK-001` is the correct first implementation task.

Never mark a task as `done` just because code was written. It must pass all `test_steps`.

## 3. Assignment model

The manager does not dump vague goals on specialist agents. Every assignment must include:

- Task ID.
- Responsible agent.
- Scope.
- Files likely to touch.
- Acceptance criteria.
- Test steps.
- Explicit out-of-scope items.
- Required summary format.
- Commit expectations.

Assignment files go in:

```text
.openclaw/handoffs/TASK-XXX-agent.md
```

## 4. Agent responsibilities

### backend

Use for:

- NestJS backend.
- Prisma schema and migrations.
- PostgreSQL.
- Auth, sessions, RBAC, CSRF, rate limiting.
- Business domain APIs.
- Scale API.
- AuditLog and ScaleSyncLog.
- File upload backend.

Backend must not build unrelated UI.

### frontend

Use for:

- React + TypeScript.
- RTK Query.
- UI pages and components.
- Forms, tables, route protection, error states.
- Frontend API integration.

Frontend must not invent backend contracts without checking PRD and existing backend code.

### tester

Use for:

- Running `test_steps` from `tasks.json`.
- Docker Compose smoke tests.
- API checks with curl.
- UI smoke checks where possible.
- Regression reports.

Tester must report exact commands, outputs, failures, and environment assumptions.

### reviewer

Use for:

- Scope review.
- PRD alignment.
- Security review.
- Architecture review.
- Migration/data model review.
- Detecting unrelated changes.

Reviewer must not silently modify code unless explicitly assigned a fix task.

## 5. Status lifecycle

Allowed statuses in `tasks.json`:

- `pending`
- `in_progress`
- `blocked`
- `review`
- `testing`
- `done`

If the existing `tasks.json` only uses `pending` and `done`, you may introduce intermediate statuses only if the human agrees or project workflow already uses them.

Default conservative behavior:

- Use `progress.md` for `assigned`, `review`, and `testing`.
- Change `tasks.json` to `done` only after tests pass.
- Do not delete tasks.
- Do not rewrite task descriptions, dependencies, acceptance criteria, or test_steps without explicit human approval.

## 6. Progress log format

Append to `progress.md` after every assignment, review, test, or completion:

```markdown
## YYYY-MM-DD HH:MM — TASK-XXX — short title

Status: assigned | in progress | blocked | review | testing | done
Owner: backend | frontend | tester | reviewer | manager
Summary:
- ...

Evidence:
- Commit: ...
- Tests: ...
- Files: ...

Next:
- ...
```

Use local time if known. Otherwise use UTC and say UTC.

## 7. Git rules

Before assigning work:

```bash
git status --short
```

If there are uncommitted changes, identify who owns them before assigning another coding task.

Implementation agents should commit after logical changes:

```bash
git add ...
git commit -m "TASK-XXX: concise description"
```

Manager should not ask agents to force-push, reset hard, rebase, or delete branches unless the human explicitly approves.

## 8. Locking

Before assigning a task, create a simple lock:

```bash
mkdir -p .openclaw/locks
cat > .openclaw/locks/TASK-XXX.lock <<'LOCK'
task: TASK-XXX
owner: backend|frontend|tester|reviewer
created_at: YYYY-MM-DD HH:MM
status: assigned
LOCK
```

Remove the lock only after the task is done, cancelled, or reassigned.

## 9. Handoff template

Use this template when creating a specialist handoff:

```markdown
# Handoff — TASK-XXX — AgentName

## Mission

Implement exactly TASK-XXX.

## Read first

- PRD.md
- tasks.json entry for TASK-XXX
- progress.md
- git log --oneline -20

## Scope

...

## Acceptance criteria

...

## Test steps

...

## Out of scope

...

## Constraints

- Work only on TASK-XXX.
- Do not modify unrelated modules.
- Do not mark the task done.
- Commit after logical changes.
- Report exact commands and test results.

## Completion report

Return:

- Summary of changes.
- Files changed.
- Commits created.
- Tests run.
- Known limitations.
- Questions/blockers.
```

## 10. Safety rules

Never install third-party OpenClaw skills or execute remote scripts without explicit human approval.

Never expose secrets from `.env`, tokens, cookies, SSH keys, database passwords, or Telegram bot tokens.

Never log plaintext passwords, session tokens, invite tokens, reset tokens, or scale apiTokens.

For security-sensitive tasks, explicitly check PRD Security MVP requirements before assignment and review.
