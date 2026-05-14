# Handoff — TASK-008 — Backend

## Task

- ID: TASK-008
- Category: security
- Priority: critical
- Description: Реализовать session guard, RBAC guard и проверку доступа operator к назначенным магазинам
- Assigned agent: backend
- Repo path: `/home/clawd/projects/scale-admin`
- Branch: `task/TASK-008-session-rbac-store-access`

## Source of truth

Read before editing:

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`

Relevant PRD sections:

- 6.1 Authorization, sessions and roles
- 6.2 Users and access
- 6.3 Stores
- 7.1 User
- 7.3 UserSession
- 7.4 UserStoreAccess
- 9.5 Auth
- 10 Recommended modular backend structure
- 11.1 Authentication and sessions
- 11.4 Authorization

## Scope

Implement backend session guard, RBAC guard/decorators, and store access checks for operators.

Expected backend behavior:

- Protected endpoints require a valid active cookie-backed session.
- Admin users can access all stores and admin-only endpoints.
- Operator users can access only stores with active `UserStoreAccess` (`revokedAt = null`).
- Store access enforcement is backend-side; frontend hiding is not sufficient.
- Add reusable auth primitives in/near `AuthModule` for:
  - current authenticated user/session on requests;
  - requiring authenticated sessions;
  - requiring roles (`admin`, `operator` as appropriate);
  - checking store access by `storeId` path/query/body parameter or a service method.
- Add minimal verification endpoints only as needed to prove the guards and access checks before full Stores CRUD exists.
- After permission changes, sessions must be revocable/invalidated or the design must expose a reusable service method for future permission-changing tasks to revoke affected user sessions. Do not implement full users/access CRUD from later tasks.

Recommended implementation files/areas:

- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.service.ts`
- New guard/decorator/types under `backend/src/auth/`
- `backend/src/stores/stores.module.ts` and minimal controller/service only if useful for protected store access verification
- `backend/src/users/users.module.ts` only if a session-revocation helper belongs there
- `backend/src/app.module.ts` if new controllers/providers must be wired
- Tests/scripts/docs only where useful for the task

## Acceptance criteria

- Protected endpoints требуют валидную активную session.
- Admin имеет доступ ко всем магазинам и админским endpoints.
- Operator получает доступ только к магазинам с активным UserStoreAccess.
- Frontend-only скрытие UI не является единственной защитой.
- После изменения permission session id регенерируется или старая сессия отзывается.

## Required test steps

Run and report exact commands/results:

1. Создать admin и operator с доступом только к одному магазину.
2. Отправить backend-запрос operator к назначенному магазину и получить успех.
3. Отправить backend-запрос operator к чужому магазину и получить 403.
4. Проверить, что admin получает доступ к обоим магазинам.

Also run:

- `cd backend && npm run build`
- Prisma validation/generation if schema or Prisma usage requires it.
- Any focused curl/HTTP checks needed to prove session guard/RBAC behavior.

## Hard rules

- Work only on branch: `task/TASK-008-session-rbac-store-access`.
- Before editing, run:
  - `cd /home/clawd/projects/scale-admin`
  - `git branch --show-current`
  - `git status --short`
- Stop and report blocker if current branch is not `task/TASK-008-session-rbac-store-access`.
- Stop and report blocker if unexpected uncommitted/untracked changes exist.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not use tester/reviewer.
- Do not implement TASK-009 CSRF/rate limiting.
- Do not implement full invite/password reset/users CRUD/store CRUD beyond the minimal code needed to verify TASK-008 guards/access checks.
- Do not log plaintext passwords, session tokens, reset tokens, invite tokens, or API tokens.

## Required ACK

Reply first with exactly:

```text
ACK_TASK-008_RECEIVED
handoff_read: yes
will_not_mark_tasks_json_done: yes
blocked: no
```

After ACK, continue implementation immediately unless blocked.

## Final report requirements

Final report must include:

- Summary
- Current branch
- Files changed
- Commits, including implementation commit hash
- Tests run
- Test results
- Exact outputs/URLs/headers where relevant
- Scope check
- Known limitations
- Blockers, if any
- Whether `tasks.json` was changed
- Explicit statement: `tasks.json was not marked done by me.`
