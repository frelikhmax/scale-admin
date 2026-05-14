# Handoff — TASK-007 — Backend

## Task

- ID: TASK-007
- Category: security
- Priority: critical
- Description: Реализовать login/logout с cookie-based server-side sessions и безопасным хранением session token hash
- Assigned agent: backend
- Repo path: `/home/clawd/projects/scale-admin`
- Branch: `task/TASK-007-login-sessions`

## Source of truth

Read before editing:

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`

Relevant PRD sections:

- 6.1 Authorization, sessions and roles
- 7.1 User
- 7.2 UserCredential
- 7.3 UserSession
- 9.5 Auth
- 11.1 Authentication and sessions
- 11.3 Passwords and user auth

## Scope

Implement backend login/logout with cookie-based server-side sessions.

Expected backend behavior:

- `POST /api/auth/login` accepts email/password.
- Valid active user with valid password gets a new random session token in an HttpOnly cookie.
- UserSession row is created with only a hash of the session token; plain token must never be stored.
- Invalid password does not create a session.
- Blocked or deleted users cannot log in.
- `POST /api/auth/logout` revokes the current active session by setting `revokedAt` and `revokedReason`.
- Support idle timeout and absolute timeout for sessions.
- Cookie has HttpOnly and SameSite Lax or Strict; Secure must be true in production.
- Add a minimal protected endpoint or session inspection endpoint only if needed to verify logout/session behavior for TASK-007, without implementing full TASK-008 RBAC scope.
- Keep implementation modular inside AuthModule and related auth/session files.

Recommended implementation files/areas:

- `backend/src/auth/auth.module.ts`
- New auth controller/service/session/password utilities under `backend/src/auth/`
- `backend/src/config/*` if new env values are needed
- `backend/src/main.ts` only if cookie parsing or request middleware is needed
- `backend/package.json` and `backend/package-lock.json` if dependencies are needed
- `backend/.env.example` if new env variables are added
- Tests/scripts/docs only where useful for the task

## Acceptance criteria

- Пользователь может войти по email и password.
- Неверный пароль не создаёт сессию.
- Blocked user не может войти.
- Session token хранится в базе только как hash.
- Cookie имеет HttpOnly, SameSite=Lax или Strict и Secure в production.
- Logout заполняет revokedAt у активной сессии.
- Поддержаны idle timeout и absolute timeout.

## Required test steps

Run and report exact commands/results:

1. Войти под seed admin с корректным паролем.
2. Проверить в devtools/curl headers, что cookie HttpOnly и имеет корректные атрибуты.
3. Выполнить logout и убедиться, что защищённый endpoint больше не доступен or session is revoked and no longer accepted.
4. Попробовать войти с неверным паролем и blocked-пользователем, ожидая отказ.

Also run:

- `cd backend && npm run build`
- Prisma validation/generation if schema or Prisma usage requires it.

## Hard rules

- Work only on branch: `task/TASK-007-login-sessions`.
- Before editing, run:
  - `cd /home/clawd/projects/scale-admin`
  - `git branch --show-current`
  - `git status --short`
- Stop and report blocker if current branch is not `task/TASK-007-login-sessions`.
- Stop and report blocker if unexpected uncommitted/untracked changes exist.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not use tester/reviewer.
- Do not implement TASK-008 RBAC/store access beyond minimal session verification needed for TASK-007.
- Do not log plaintext passwords or session tokens.
- Do not store plaintext session tokens in database.

## Required ACK

Reply first with exactly:

```text
ACK_TASK-007_RECEIVED
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
