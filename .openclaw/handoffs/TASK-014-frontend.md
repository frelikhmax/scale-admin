# Handoff — TASK-014 — Frontend

## Task

- ID: TASK-014
- Category: ui
- Priority: high
- Description: Создать Login UI, logout и frontend session state
- Assigned agent: frontend
- Repo path: `/home/clawd/projects/scale-admin`
- Branch: `task/TASK-014-login-ui-session-state`

## Source of truth

Read before editing:

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`
- Backend auth endpoints in `backend/src/auth/auth.controller.ts`

## Why this task is valid

- `TASK-014` is pending.
- Dependencies `TASK-006` and `TASK-007` are done in `tasks.json`.
- The task is high-priority UI work and unlocks later UI tasks.

## Scope

Implement login/logout UI and frontend session state only.

Expected frontend behavior:

- App shows Login when there is no active session.
- Login form submits email/password to backend auth endpoint using the shared RTK Query backend API client.
- Cookies are included through the existing shared backend API layer.
- Successful login stores frontend session/user state and routes/displays Dashboard.
- Logout calls backend logout, clears frontend session state, and returns to Login.
- Protected frontend routes/views require an active session.
- Invalid password and blocked/inactive user responses are displayed as clear user-facing errors.
- Keep the existing health check available in an appropriate small dashboard/system-status area or equivalent, without regressing TASK-006.

Known backend endpoints:

- `POST /api/auth/login` -> `{ user, expiresAt }`, sets HttpOnly session cookie.
- `POST /api/auth/logout` -> `{ revoked }`, clears cookie.
- `GET /api/auth/session` -> current session/user or 401.

## Acceptance criteria

- Пользователь может войти через форму Login.
- Ошибки неверного пароля и blocked user отображаются понятно.
- После login пользователь попадает в Dashboard.
- Logout очищает frontend session state и вызывает backend logout.
- Protected frontend routes требуют активной сессии.

## Required test steps

Run and report exact commands/results:

1. Открыть frontend без сессии и убедиться, что показывается Login.
2. Войти корректными admin-учётными данными.
3. Нажать logout и проверить возврат на Login.
4. Ввести неверный пароль и проверить сообщение об ошибке.

Also run:

- `cd frontend && npm run build`
- Any focused frontend lint/typecheck/test command that already exists.
- Focused source/API checks as needed to prove login/logout/session use RTK Query shared backend API with credentials.

## Hard rules

- Work only on branch: `task/TASK-014-login-ui-session-state`.
- Before editing, run:
  - `cd /home/clawd/projects/scale-admin`
  - `git branch --show-current`
  - `git status --short`
- Stop and report blocker if current branch is not `task/TASK-014-login-ui-session-state`.
- Stop and report blocker if unexpected uncommitted/untracked changes exist, except this manager coordination handoff/lock/progress commit.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not remove `.openclaw/locks/TASK-014.lock`.
- Do not use tester/reviewer.
- Do not implement Users & Access, Stores UI, Products UI, or unrelated later screens.

## Required ACK

Reply first with exactly:

```text
ACK_TASK-014_RECEIVED
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
