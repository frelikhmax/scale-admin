# Handoff: TASK-025 -> backend

## Task
- ID: TASK-025
- Priority: high
- Category: functional
- Description: Реализовать CatalogProductPlacement CRUD, перемещение товаров и ограничения active-размещений
- Branch: task/TASK-025-catalog-product-placement-crud

## Canonical workflow constraints
- Work only on this branch.
- Implement only this task scope; avoid unrelated refactors.
- Do not mark `tasks.json` done and do not edit `progress.md` for closure; manager handles closure after verification.
- Commit implementation changes with a clear message.
- Report changed files, implementation commit(s), tests run, and any blockers/limitations.
- Do not expose secrets in logs or commits.

## Acceptance criteria
- Можно добавить active Product из справочника в active Category active catalog
- categoryId должен принадлежать тому же catalogId
- Archived product нельзя добавить в active-placement
- Archived category нельзя использовать для active-placement
- В MVP один productId может иметь только одно active-размещение в одном catalogId
- Повторное добавление товара возвращает сценарий перемещения существующего placement
- sortOrder товаров внутри категории сохраняется
- Размещение и перемещение пишутся в AuditLog

## Required test steps
- Шаг 1: Добавить active-товар в active-категорию
- Шаг 2: Попробовать добавить тот же товар в другую категорию того же каталога и проверить предложение перемещения
- Шаг 3: Выполнить перемещение и проверить изменение categoryId
- Шаг 4: Попробовать добавить archived-товар и получить отказ
- Шаг 5: Попробовать добавить товар в archived-категорию и получить отказ
- Шаг 6: Изменить sortOrder и проверить сохранение порядка

## Dependencies
- TASK-021: done
- TASK-023: done

## Implementation guidance
- Use existing auth/session/RBAC/store access guards and current catalog/category/product services patterns.
- Implement CatalogProductPlacement CRUD/move/sort APIs in the backend, scoped to a store active catalog where appropriate.
- Validate category/catalog ownership, archived product/category restrictions, one active placement per product per catalog, and sortOrder persistence.
- Add AuditLog entries for placement create/move/reorder/status changes without secrets.
