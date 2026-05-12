# Handoff — TASK-001 — backend

## Mission

Implement exactly TASK-001: create the base monorepo/skeleton project with Docker Compose, backend, frontend, and PostgreSQL.

## Read first

- PRD.md
- tasks.json entry for TASK-001
- progress.md
- git log --oneline -20

## Scope

Create the initial project skeleton needed for the Scale Admin MVP:

- backend directory and minimal backend app;
- frontend directory and minimal frontend app;
- PostgreSQL service in Docker Compose;
- Docker Compose wiring for PostgreSQL, backend, and frontend;
- backend health endpoint;
- frontend page/state that calls or displays backend health status.

## Files likely to touch

- docker-compose.yml or compose equivalent
- backend/**
- frontend/**
- package/project config files required for the skeleton
- README or env example only if needed to run TASK-001 test steps

## Acceptance criteria

- В репозитории есть отдельные директории для backend и frontend.
- Docker Compose поднимает PostgreSQL, backend и frontend.
- Backend имеет health endpoint, доступный из браузера или curl.
- Frontend запускается и может обратиться к backend health endpoint.

## Test steps

- Шаг 1: Запустить docker compose up --build.
- Шаг 2: Открыть backend health endpoint или выполнить curl к нему.
- Шаг 3: Открыть frontend и проверить, что он показывает успешный статус backend.

## Out of scope

- Do not implement auth, users, stores, products, catalog, prices, advertising, publishing, scales, logs, files, or email modules.
- Do not add Prisma or migrations.
- Do not implement security flows, sessions, RBAC, CSRF, rate limiting, invite, or password reset.
- Do not mark TASK-001 as done.
- Do not edit unrelated task definitions.

## Constraints

- Work only on TASK-001.
- Do not modify unrelated modules.
- Do not mark the task done.
- Commit after logical changes.
- Report exact commands and test results.
- If test_steps cannot pass, document the blocker precisely.

## Completion report

Return:

- Summary of changes.
- Files changed.
- Commits created.
- Tests run.
- Exact health endpoint URL and frontend URL used.
- Known limitations.
- Questions/blockers.
