# TASK-028 handoff — frontend

## Task
TASK-028 — Создать Prices tab с таблицей товаров, фильтрами и inline-редактированием цены

## Priority and dependencies
- Priority: high
- Dependencies satisfied: TASK-017 done, TASK-027 done

## Scope
Implement frontend UI for Store Details -> Prices using the existing backend Prices API:
- `GET /api/stores/:storeId/prices?search=&categoryId=&missingPrice=`
- `PUT /api/stores/:storeId/prices/:productId`

## Acceptance criteria
- Prices tab displays products from active catalog for the selected store.
- Columns include Product name, Short name, PLU, SKU/barcode, Category, Current price, Unit, Status, UpdatedAt.
- Search works by name, shortName, defaultPluCode, sku and barcode.
- Category filter and missing-price filter are available.
- Inline price editing saves the store price.
- Products without price and invalid prices are highlighted.

## Likely files/areas
- `frontend/src/main.tsx`
- `frontend/src/features/stores/storesApi.ts`
- new frontend feature file(s) if useful, e.g. `frontend/src/features/prices/pricesApi.ts`
- `frontend/src/shared/api/backendApi.ts` tag types if needed
- `frontend/src/styles.css`

## Constraints
- Work only on branch `task/TASK-028-prices-tab-ui`.
- Do not mark `tasks.json` done.
- Do not edit unrelated backend implementation unless absolutely required and reported.
- Use existing RTK Query backend API with cookies included.
- Use CSRF token/header for PUT price mutations.

## Required checks before reporting completion
- `npm --prefix frontend run build`
- `npm --prefix frontend exec tsc -- -b` if not already included by build
- Any focused source/API checks you can run safely

## Return payload required
Report:
- completion status
- summary
- changed files
- commits
- tests/checks run with exact results
- blockers or limitations
