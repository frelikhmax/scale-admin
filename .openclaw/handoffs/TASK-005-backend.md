# Handoff — TASK-005 — backend

## Task

TASK-005 — Добавить seed-скрипт для первого admin-пользователя и минимальных тестовых данных

## Assigned agent

backend

## Repo

`/home/clawd/projects/scale-admin`

## Branch

Work only on:

`task/TASK-005-seed-admin-data`

## Scope

Add a repeatable backend/Prisma seed implementation for the first admin user and minimal local/manual test data.

Focus on backend infrastructure only:

- Prisma seed script and package wiring.
- Secure password hashing for the seeded admin credential.
- Idempotent creation/upsert behavior so repeated seed runs do not create duplicate users, credentials, stores, catalogs, or products.
- Env-based admin seed secrets, or clearly documented local development defaults.
- Optional minimal sample data useful for manual checks: sample store, active catalog, and a few products.

Do not implement login/logout, sessions, RBAC endpoints, frontend UI, invite/reset flows, publishing, scale sync, or unrelated domain APIs.

## Acceptance criteria

- Seed creates an admin user with credential record and securely hashed password.
- Seed can be run repeatedly without creating duplicates.
- Optionally creates a sample store, active catalog, and several products for manual verification.
- Seed user secrets are taken from env or explicitly documented for local development.

## Test steps

1. Run seed on a clean database.
2. Run seed again and verify duplicates are not created.
3. Verify admin user and basic test data exist via Prisma Studio or SQL/Prisma query.

## Required files to read

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- `/home/clawd/projects/scale-admin/backend/prisma/schema.prisma`
- `/home/clawd/projects/scale-admin/backend/package.json`
- `/home/clawd/projects/scale-admin/backend/.env.example` if present
- `git log --oneline -20`

## Git hard rules

Before editing, run:

```bash
cd /home/clawd/projects/scale-admin
git branch --show-current
git status --short
```

Stop and report blocker if current branch is not exactly:

`task/TASK-005-seed-admin-data`

Stop and report blocker if unexpected uncommitted/untracked changes exist.

Do not checkout main.
Do not create another branch.
Do not merge branches.
Commit implementation changes only on the assigned task branch.
Do not mark `tasks.json` done.
Do not use or assign tester/reviewer.
Do not modify unrelated files.

## A2A protocol

First reply exactly:

```text
ACK_TASK-005_RECEIVED
handoff_read: yes
will_not_mark_tasks_json_done: yes
blocked: no
```

Then continue implementation immediately unless blocked.

After implementation and tests, commit your implementation changes on `task/TASK-005-seed-admin-data` and send final report to manager in the same A2A run whenever possible.

Required final report format:

- Summary
- Current branch
- Files changed
- Commits
- Tests run
- Test results
- Exact outputs/URLs if relevant
- Scope check
- Known limitations
- Blockers, if any
- Whether tasks.json was changed
- Explicit statement: tasks.json was not marked done by me.
