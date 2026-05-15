# Handoff: TASK-027 — StoreProductPrice API

Owner: backend
Branch: task/TASK-027-store-product-price-api
Status: assigned

## Task
Реализовать StoreProductPrice API для цен магазина с validation и audit.

## Scope
- Backend/NestJS only.
- Add Prices API in/through `backend/src/prices` and wire module if needed.
- Use existing cookie session, RBAC, and store access guards.
- Work with existing Prisma models: Store, StoreCatalog, CatalogProductPlacement, Product, Category, StoreProductPrice, AuditLog.

## Acceptance criteria
- Price is set for pair `storeId + productId`.
- MVP supports one active price per product in a store.
- Product itself is not modified when price changes.
- `price` must be > 0.
- Default currency is `RUB`.
- API returns list of active-catalog products with current prices, category, and missing-price indicator.
- Price changes are written to AuditLog.

## Expected API behavior
- User with store access can list prices for store active catalog.
- List should include active placements joined to active products/category, product fields, category fields, current active price if present, `missingPrice` flag.
- Search/filter support is useful if lightweight: product name, shortName, defaultPluCode, sku, barcode, categoryId, missingPrice.
- Create/update endpoint should upsert or replace the active price for the store/product.
- Reject `price <= 0` with validation error.
- Reject product not present in active catalog placements for that store unless there is a clear reason not to.
- Do not change Product price fields (Product has no price by design).

## Tests/checks to run and report
- `cd backend && npm run build`
- `cd backend && npx prisma validate --schema prisma/schema.prisma`
- Focused API or service checks covering:
  1. list prices for store with placed products;
  2. set valid price and verify StoreProductPrice;
  3. verify Product row did not change due to price update;
  4. `price <= 0` returns validation error;
  5. AuditLog entry exists for price change.

## Return payload required
- Completion status.
- Summary.
- Changed files.
- Commit hash(es).
- Exact tests/checks run and results.
- Known limitations/blockers.

## Constraints
- Do not mark `tasks.json` done.
- Do not edit unrelated tasks/progress closure state.
- Do not expose secrets in logs.
