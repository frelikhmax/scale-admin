# Handoff — TASK-009 — Backend

## Task

- ID: TASK-009
- Category: security
- Priority: high
- Description: Добавить CSRF-защиту и rate limiting для web auth endpoints
- Assigned agent: backend
- Repo path: `/home/clawd/projects/scale-admin`
- Branch: `task/TASK-009-csrf-rate-limit-auth-endpoints`

## Source of truth

Read before editing:

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`

Relevant PRD sections:

- 6.1 Authorization, sessions and roles
- 9.5 Auth
- 11.1 Authentication and sessions
- 11.2 API security / CSRF if present
- 11.3 Passwords and user auth

## Scope

Implement backend CSRF protection and rate limiting for web auth endpoints.

Expected backend behavior:

- State-changing web/auth endpoints require CSRF token or an equivalent protection mechanism.
- State-changing operations are not implemented as GET.
- Login has rate limiting for repeated attempts.
- Password reset and invite accept endpoints should have reusable rate-limit support if concrete endpoints do not exist yet; do not implement full invite/password-reset flows from later tasks.
- Repeated failed login attempts temporarily block or delay additional login attempts using email/IP or a similarly defensible strategy.
- CSRF failures and rate-limit failures return clear API error responses with appropriate HTTP status codes.
- Existing cookie-based session login/logout from TASK-007 must keep working when called with valid CSRF protection.
- Existing session/RBAC/store-access behavior from TASK-008 must not regress.

Recommended implementation files/areas:

- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- New auth CSRF/rate-limit guards/services/utilities under `backend/src/auth/`
- `backend/src/config/*` and `backend/.env.example` if new tunables are needed
- `backend/package.json` / lockfile only if a dependency is truly needed
- Minimal tests/scripts/docs only where useful for TASK-009

## Acceptance criteria

- Все state-changing web endpoints требуют CSRF token или эквивалентную защиту.
- State-changing операции не используют GET.
- Login, password reset и invite accept имеют rate limiting.
- Повторные неуспешные login попытки временно блокируют или задерживают вход.
- CSRF и rate limit ошибки возвращаются в понятном формате API.

## Required test steps

Run and report exact commands/results:

1. Выполнить POST state-changing запроса без CSRF token и получить отказ.
2. Повторить запрос с валидным CSRF token и получить успех.
3. Сделать серию неверных login попыток и проверить временную блокировку или задержку.
4. Убедиться, что GET endpoints не меняют состояние.

Also run:

- `cd backend && npm run build`
- Prisma validation/generation if schema or Prisma usage changes.
- Focused curl/HTTP checks proving CSRF and rate-limit status codes/bodies.
- If Docker verification is required, use the approved repository script: `scripts/openclaw-docker-verify.sh TASK-009`.

## Hard rules

- Work only on branch: `task/TASK-009-csrf-rate-limit-auth-endpoints`.
- Before editing, run:
  - `cd /home/clawd/projects/scale-admin`
  - `git branch --show-current`
  - `git status --short`
- Stop and report blocker if current branch is not `task/TASK-009-csrf-rate-limit-auth-endpoints`.
- Stop and report blocker if unexpected uncommitted/untracked changes exist.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not use tester/reviewer.
- Do not implement full TASK-010 invite flow or TASK-011 password reset flow.
- Do not weaken HttpOnly session cookies, session token hashing, RBAC guards, or store-access checks.
- Do not log plaintext passwords, session tokens, CSRF secrets, reset tokens, invite tokens, or API tokens.

## Required ACK

Reply first with exactly:

```text
ACK_TASK-009_RECEIVED
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
