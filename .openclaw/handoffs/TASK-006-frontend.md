# Handoff — TASK-006 — Frontend

## Task

- ID: TASK-006
- Category: integration
- Priority: high
- Description: Настроить frontend API layer на TypeScript и RTK Query для обращения к backend
- Assigned agent: frontend
- Repo path: `/home/clawd/projects/scale-admin`
- Branch: `task/TASK-006-integration-layer-typescript-rtk-query-client`

## Source of truth

Read before editing:

- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`

## Scope

Implement the frontend API layer in TypeScript using RTK Query for backend calls.

Expected frontend behavior:

- Frontend has a single backend API client/baseQuery abstraction.
- Backend requests include cookies/credentials.
- Basic 401, 403, and network/fetch errors are handled and surfaced as understandable UI state or typed error state.
- Backend health endpoint is called through RTK Query, not ad-hoc fetch from components.
- Existing health UI still works when backend is healthy and shows a clear error state when backend is unavailable.

Recommended implementation areas:

- `frontend/src/` API/store files as needed for RTK Query setup.
- `frontend/src/App.*` or related health UI files.
- `frontend/package.json` / lockfile if RTK dependencies are missing.
- Vite/env config only if needed to keep backend URL configurable.

## Acceptance criteria

- Frontend имеет единый API client/baseQuery для backend.
- Cookies отправляются при запросах к backend.
- Реализована базовая обработка ошибок 401, 403 и сетевых ошибок.
- Health endpoint backend вызывается через RTK Query.

## Required test steps

Run and report exact commands/results:

1. Запустить frontend и backend через Docker Compose.
2. Открыть страницу frontend с проверкой health endpoint.
3. Временно остановить backend и проверить, что frontend показывает понятное состояние ошибки.

Also run:

- `cd frontend && npm run build`
- Any focused frontend lint/typecheck/test command that already exists.
- Curl/browser/source checks needed to prove health is using RTK Query and requests include credentials.

## Hard rules

- Work only on branch: `task/TASK-006-integration-layer-typescript-rtk-query-client`.
- Before editing, run:
  - `cd /home/clawd/projects/scale-admin`
  - `git branch --show-current`
  - `git status --short`
- Stop and report blocker if current branch is not `task/TASK-006-integration-layer-typescript-rtk-query-client`.
- Stop and report blocker if unexpected uncommitted/untracked changes exist.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not use tester/reviewer.
- Do not implement authentication UI, login/logout flows, CSRF/rate limiting, or unrelated later frontend screens.

## Required ACK

Reply first with exactly:

```text
ACK_TASK-006_RECEIVED
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
