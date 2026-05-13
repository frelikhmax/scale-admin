# Handoff — TASK-002 — backend

## Mission

Implement exactly TASK-002: configure backend environment handling and create the base modular NestJS backend structure.

## Read first

- PRD.md
- tasks.json entry for TASK-002
- progress.md
- git log --oneline -20
- Existing backend source and Docker Compose setup from TASK-001

## Source-of-truth status checked by manager

- TASK-001 is `done` in `tasks.json`.
- TASK-001 implementation/verification commit exists: `f12e7ac test: mark TASK-001 verified done`.
- TASK-002 is `pending` and depends only on TASK-001.
- TASK-001 lock was released before this handoff was created.

## Scope

Set up centralized backend configuration and a modular NestJS foundation:

- Backend reads environment variables through a centralized config approach.
- Critical environment variables are validated on application startup.
- Startup fails with a clear error when a required environment variable is missing.
- Create empty NestJS modules:
  - Auth
  - Users
  - Stores
  - Products
  - Catalog
  - Prices
  - Advertising
  - Publishing
  - Scales
  - Logs
  - Files
  - Email

## Files likely to touch

- backend/package.json / package-lock.json if config dependencies are needed
- backend/src/**
- backend/.env.example or equivalent env documentation if needed
- Docker/backend startup configuration only if required for env wiring
- README only if needed to document local env requirements

## Acceptance criteria

- Backend читает env-переменные через централизованный конфиг.
- Критичные env-переменные валидируются при старте приложения.
- Созданы пустые модули Auth, Users, Stores, Products, Catalog, Prices, Advertising, Publishing, Scales, Logs, Files и Email.
- Backend не стартует с понятной ошибкой при отсутствии обязательного env.

## Test steps

- Шаг 1: Запустить backend с корректным `.env`.
- Шаг 2: Убедиться, что приложение стартует без ошибок.
- Шаг 3: Временно убрать обязательную env-переменную и проверить, что старт падает с понятным сообщением.

## Out of scope

- Do not implement product features or business logic inside the empty modules.
- Do not add Prisma or database migrations.
- Do not implement auth/session/RBAC/CSRF/rate limiting flows.
- Do not implement frontend changes unless strictly required to keep existing health check running.
- Do not assign tester or reviewer.
- Do not mark TASK-002 as done unless you have completed all required implementation and all test_steps pass according to project workflow.

## Constraints

- Work only on TASK-002.
- Do not modify unrelated task definitions.
- Keep TASK-001 closed; do not recreate its lock.
- Commit after logical changes.
- Report exact commands and test results.
- If test_steps cannot pass, document the blocker precisely.

## Completion report

Return:

- Summary of changes.
- Files changed.
- Commits created.
- Tests run, including the missing-env failure check.
- Required env variables added/validated.
- Known limitations.
- Questions/blockers.
