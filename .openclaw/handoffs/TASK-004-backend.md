# Handoff — TASK-004 — backend

## Mission

Implement exactly TASK-004: add Prisma models for the business domain, publishing, scale devices, files, and sync logs.

## Required files to read first

- /home/clawd/projects/scale-admin/PRD.md
- /home/clawd/projects/scale-admin/tasks.json entry for TASK-004
- /home/clawd/projects/scale-admin/progress.md
- /home/clawd/projects/scale-admin/.openclaw/handoffs/TASK-004-backend.md
- `git log --oneline -20`
- Existing backend Prisma/source under `/home/clawd/projects/scale-admin/backend`

## Source-of-truth status checked by manager

- Repository was clean before assignment.
- No active lock files existed in `.openclaw/locks/`.
- TASK-001 is `done` in `tasks.json`.
- TASK-002 is `done` in `tasks.json`.
- TASK-003 is `done` in `tasks.json` and closed by manager in commit `6492950 test: mark TASK-003 verified done`.
- TASK-004 is `pending` and depends only on TASK-003.
- TASK-004 dependency TASK-003 is done.
- Selected implementation agent: backend.
- Tester/reviewer are intentionally excluded.

## Scope

Add the MVP business-domain Prisma schema and migration on top of the existing auth/access migration.

Implement, at minimum, Prisma models and database migration support for:

- `Store`
- `StoreCatalog`
- `Product`
- `Category`
- `CatalogProductPlacement`
- `StoreProductPrice`
- `AdvertisingBanner`
- `CatalogVersion`
- `ScaleDevice`
- `ScaleSyncLog`
- `FileAsset`

Required relationship/constraint coverage:

- Stores have catalogs, prices, banners, scale devices, sync logs, files where applicable.
- StoreCatalog belongs to Store and has categories, placements, versions, and `currentVersionId` relation support.
- Category belongs to StoreCatalog and supports parent/child category relationships within the catalog.
- CatalogProductPlacement links catalog/category/product.
- StoreProductPrice links store/product.
- CatalogVersion belongs to catalog and stores immutable `packageData`, checksum, version number, publication metadata.
- ScaleDevice belongs to store and can reference current catalog version.
- ScaleSyncLog links scale device/store/catalog version where appropriate.
- FileAsset supports local uploaded assets and owner/uploader references where appropriate.
- Add unique constraints required by TASK-004:
  - `Store.code`
  - `Product.defaultPluCode`
  - `ScaleDevice.deviceCode`
  - `CatalogVersion.versionNumber` inside `catalogId`
- Preserve TASK-003 auth/access models and existing partial unique indexes.
- Add database-level integrity where Prisma supports it; use explicit migration SQL for constraints/indexes Prisma cannot express directly.
- Migration must apply successfully on top of the previous clean TASK-003 migration.

## Acceptance criteria

- В схеме есть Store, StoreCatalog, Product, Category, CatalogProductPlacement, StoreProductPrice, AdvertisingBanner, CatalogVersion, ScaleDevice, ScaleSyncLog и FileAsset.
- Заданы связи между магазинами, каталогами, категориями, товарами, ценами, версиями и весами.
- Добавлены уникальные ограничения для Store.code, Product.defaultPluCode, ScaleDevice.deviceCode и versionNumber внутри catalogId.
- Миграция успешно применяется поверх предыдущей.

## Test steps

- Шаг 1: Выполнить миграцию Prisma для бизнес-моделей.
- Шаг 2: Проверить, что все таблицы созданы в PostgreSQL.
- Шаг 3: Создать тестовые записи Store, StoreCatalog и Product через seed или Prisma Studio.

## Files likely to touch

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/**`
- `backend/package.json` / `backend/package-lock.json` only if a real implementation need appears
- Backend docs/env examples only if needed for migration instructions

## Out of scope

- Do not add seed script for TASK-005 except minimal temporary/manual test data commands for verification.
- Do not implement login/logout/session guard/RBAC endpoints.
- Do not implement Store CRUD/API, Product CRUD/API, upload API, publishing API, scale sync API, or frontend changes.
- Do not assign tester or reviewer.
- Do not mark TASK-004 or any task as done in `tasks.json`.

## Hard rules

- Work only on TASK-004.
- Do not mark `tasks.json` done. Manager will do that only after verification.
- Do not use tester/reviewer.
- Commit implementation changes.
- Run all TASK-004 test steps before final report, unless genuinely blocked.
- If you must deviate, explain precisely in the final report.

## Required ACK format

ACK_TASK-004_RECEIVED
handoff_read: yes
will_not_mark_tasks_json_done: yes
blocked: no

## Required final report format

- Summary
- Files changed
- Commits
- Tests run
- Test results
- Exact outputs/URLs if relevant
- Scope check
- Known limitations
- Blockers, if any
- Whether tasks.json was changed
- Explicit: tasks.json was not marked done by me.
