# TASK-018 backend handoff

Task: TASK-018
Branch: task/TASK-018-store-details-api
Assigned agent: backend

## Description

Реализовать Store Details API с active catalog, overview и access checks.

## Acceptance criteria

- Backend возвращает Store Details с active StoreCatalog.
- Store Details включает базовый overview магазина и currentVersionId каталога.
- Admin может открыть любой магазин.
- Operator может открыть только назначенный магазин.
- Весы и логи пока могут возвращаться пустыми секциями, если соответствующие модули не готовы.

## Test steps

1. Под admin запросить Store Details любого магазина и получить данные.
2. Под operator запросить назначенный магазин и получить данные.
3. Под operator запросить чужой магазин и получить 403.
4. Проверить, что в ответе есть active catalog.

## Scope and constraints

- Work only on this task and only on branch `task/TASK-018-store-details-api`.
- Implement backend/NestJS/Prisma changes only; do not build frontend UI for this task.
- Reuse existing auth/session/RBAC/store access infrastructure from prior tasks.
- Do not mark `tasks.json` as done; manager will close after verification.
- Do not release `.openclaw/locks/TASK-018.lock`; manager releases it after verification.
- Avoid unrelated refactors and unrelated file changes.
- Do not expose plaintext secrets/tokens in logs or progress.

## Expected completion report

Report:

- implementation commit hash(es),
- changed files,
- exact tests/checks run and results,
- API shape/endpoints added or changed,
- any known limitations or blockers.
