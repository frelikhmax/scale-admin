# Handoff: TASK-023 — backend

## Task
Реализовать Category CRUD, дерево, sortOrder и validation внутри StoreCatalog.

## Selected agent
backend

## Branch
`task/TASK-023-category-crud-tree`

## Dependencies confirmed done
- TASK-018 — Store Details API with active catalog and access checks

## Acceptance criteria
- Пользователь с доступом к магазину может создать root-категорию.
- Пользователь может создать child-категорию в пределах лимита глубины 2–3 уровня.
- parentId может ссылаться только на категорию того же catalogId.
- Циклы категорий запрещены.
- sortOrder сохраняется среди категорий одного уровня.
- Archived-категория не может использоваться для новых active-размещений.
- Изменения категорий пишутся в AuditLog.

## Required test steps
1. Создать root-категорию в active catalog магазина.
2. Создать child-категорию и проверить parentId.
3. Попробовать выбрать parent из другого catalogId и получить отказ.
4. Попробовать создать цикл и получить отказ.
5. Изменить порядок категорий и проверить сохранение sortOrder.
6. Проверить AuditLog изменений.

## Scope guidance
- Implement backend/NestJS/Prisma category API and validation only.
- Reuse existing session/RBAC/store-access infrastructure and active catalog lookup patterns from Stores/Products modules.
- Category belongs to `StoreCatalog`; do not add direct `storeId` to Category unless absolutely required and justified.
- Enforce same-catalog parent validation and depth limit of 2–3 levels.
- Prevent cycles on updates/moves.
- Keep `sortOrder` meaningful among sibling categories under the same parent/root.
- Archived categories must be clearly unavailable for future active placements; if placement APIs do not exist yet, expose/validate status semantics needed by later TASK-025 and report it.
- Write AuditLog entries for create/update/reorder/archive/status changes.

## Likely files
- `backend/src/catalog/catalog.module.ts`
- `backend/src/catalog/*`
- `backend/src/stores/stores.service.ts` only if shared active-catalog helper is needed
- `backend/prisma/schema.prisma` only if strictly necessary; prefer existing models

## Workflow constraints
- Work only on this task and this branch.
- Do not mark `tasks.json` done.
- Do not remove or release `.openclaw/locks/TASK-023.lock`.
- Do not edit frontend/UI files.
- Avoid unrelated refactors.
- Commit implementation changes with a clear TASK-023 message.
- Do not expose secrets/tokens in logs.

## Required completion report
Return:
- completion status: PASS or BLOCKED
- summary
- changed files
- implementation commit hash(es)
- exact tests/checks run and results
- API endpoints added/changed
- acceptance/test-step notes
- blockers or known limitations, if any
- confirmation that `tasks.json` was not marked done and lock was not released
