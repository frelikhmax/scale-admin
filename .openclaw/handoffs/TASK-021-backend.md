# Handoff: TASK-021 — backend

## Task
Реализовать Product master catalog CRUD, поиск, validation и audit

## Selected agent
backend

## Branch
`task/TASK-021-product-master-crud`

## Dependencies
TASK-008, TASK-004

## Acceptance criteria
- Admin и operator могут создавать и редактировать товары
- Нельзя создать товар без defaultPluCode, name, shortName, unit и status
- defaultPluCode уникален
- Поиск работает по name, shortName, defaultPluCode, sku и barcode
- Archived-товар помечается как недоступный для новых active-размещений
- При редактировании товара, используемого в каталогах, API возвращает warning или требует подтверждение
- Создание и изменение товара пишутся в AuditLog

## Required test steps
- Шаг 1: Создать товар с обязательными полями и проверить успешный ответ
- Шаг 2: Попробовать создать товар без shortName и получить validation error
- Шаг 3: Попробовать создать второй товар с тем же defaultPluCode и получить отказ
- Шаг 4: Найти товар по name, PLU, sku и barcode
- Шаг 5: Отредактировать используемый товар и проверить warning/confirmation flow
- Шаг 6: Проверить AuditLog изменений

## Workflow constraints
- Work only on this task and this branch.
- Do not mark `tasks.json` done.
- Do not remove or release the lock.
- Commit implementation changes with a clear message.
- Run focused backend tests/build/Prisma checks and task-specific API checks where possible.
- Report: commits, changed files, exact tests/results, known limitations/blockers.
- Do not expose secrets in logs.

## Scope guidance
Implement backend Product master catalog CRUD/list/search/update semantics using existing auth/session/RBAC patterns. Keep Product independent of store/category/price. Add validation, duplicate handling, used-product warning/confirmation behavior, archive semantics needed by later placement tasks, and AuditLog entries for create/update/status changes.
