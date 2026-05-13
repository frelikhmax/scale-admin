# Handoff — TASK-003 — backend

## Mission

Implement exactly TASK-003: add Prisma for auth/access models and perform the first migration.

## Required files to read first

- /home/clawd/projects/scale-admin/PRD.md
- /home/clawd/projects/scale-admin/tasks.json entry for TASK-003
- /home/clawd/projects/scale-admin/progress.md
- /home/clawd/projects/scale-admin/.openclaw/handoffs/TASK-003-backend.md
- `git log --oneline -20`
- Existing backend source under `/home/clawd/projects/scale-admin/backend`

## Source-of-truth status checked by manager

- Repository was clean before assignment.
- No active lock files existed in `.openclaw/locks/`.
- TASK-001 is `done` in `tasks.json`.
- TASK-002 is `done` in `tasks.json` and closed by manager in commit `c3344d9 test: mark TASK-002 verified done`.
- TASK-003 is `pending` and depends only on TASK-002.
- TASK-003 dependency TASK-002 is done.
- Selected implementation agent: backend.
- Tester/reviewer are intentionally excluded.

## Scope

Add Prisma to the NestJS backend for the first auth/access database migration.

Implement, at minimum:

- Prisma installed/configured for backend.
- `backend/prisma/schema.prisma` configured for PostgreSQL using `DATABASE_URL`.
- First migration committed under `backend/prisma/migrations/`.
- NestJS Prisma integration if needed for project foundation, e.g. Prisma module/service.
- Auth/access models in Prisma schema:
  - `User`
  - `UserCredential`
  - `UserSession`
  - `UserInvite`
  - `PasswordResetToken`
  - `UserStoreAccess`
  - `AuditLog`
- Soft-delete support on users sufficient to support uniqueness requirement below.
- Uniqueness of `emailNormalized` among non-deleted users enforced at database or service/schema level. Prefer a PostgreSQL partial unique index in the migration if Prisma schema cannot express it directly.
- Migration must apply successfully on a clean PostgreSQL database.

## Acceptance criteria

- Prisma подключена к PostgreSQL.
- В схеме есть User, UserCredential, UserSession, UserInvite, PasswordResetToken, UserStoreAccess и AuditLog.
- Уникальность emailNormalized среди неудалённых пользователей обеспечена на уровне базы или сервиса.
- Миграция успешно применяется на чистую базу.

## Test steps

- Шаг 1: Очистить локальную базу разработки.
- Шаг 2: Выполнить prisma migrate dev или аналогичную команду миграции.
- Шаг 3: Открыть Prisma Studio или выполнить SQL-запрос и проверить наличие auth/access таблиц.

## Files likely to touch

- `backend/package.json`
- `backend/package-lock.json`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/**`
- `backend/src/prisma/**` if adding NestJS Prisma service/module
- `backend/src/app.module.ts` if wiring PrismaModule
- `backend/.env.example` only if needed to document Prisma env usage
- README/docs only if needed for migration instructions

## Out of scope

- Do not implement business-domain Prisma models for TASK-004.
- Do not add seed script for TASK-005.
- Do not implement login/logout/session guard/RBAC endpoints.
- Do not implement frontend changes.
- Do not assign tester or reviewer.
- Do not mark TASK-003 or any task as done in `tasks.json`.

## Hard rules

- Work only on TASK-003.
- Do not mark `tasks.json` done. Manager will do that only after verification.
- Do not use tester/reviewer.
- Commit implementation changes.
- Run all TASK-003 test steps before final report, unless genuinely blocked.
- If you must deviate, explain precisely in the final report.

## Required ACK format

ACK_TASK-003_RECEIVED
handoff_read: yes
will_not_mark_tasks_json_done: yes
blocked: no

## Required final report format

- Summary
- Files changed
- Commits
- Tests run
- Test results
- Exact outputs/URLs if relevant
- Scope check
- Known limitations
- Blockers, if any
- Whether tasks.json was changed
- Explicit: tasks.json was not marked done by me.
