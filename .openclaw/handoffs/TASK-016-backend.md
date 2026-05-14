# TASK-016 backend handoff

Task: TASK-016 — Реализовать Store CRUD с авто-созданием основного active-каталога
Agent: backend
Branch: task/TASK-016-store-crud

Scope:
- Implement backend Store CRUD API in the existing NestJS stores module.
- Admin can create a store with code, name, address, timezone, status.
- Store.code must remain unique and return a useful conflict/error on duplicates.
- Admin can edit store fields.
- When creating an active store, automatically create the main active StoreCatalog in the same transaction.
- Operator cannot create or edit stores; enforce RBAC with existing guards/decorators.
- Write AuditLog records for create and update.

Acceptance criteria:
1. Admin can create a store with code, name, address, timezone, and status.
2. Store.code is unique.
3. Admin can edit a store.
4. Creating an active store creates a main active StoreCatalog.
5. Operator cannot create/edit stores.
6. Create and update write AuditLog.

Task test steps:
1. Under admin, create an active store through API.
2. Verify StoreCatalog with status active was created.
3. Try creating another store with same code and get rejection.
4. Under operator, try creating a store and get 403.
5. Verify AuditLog for create and edit.

Likely files:
- backend/src/stores/stores.controller.ts
- backend/src/stores/stores.service.ts
- backend/src/app.module.ts only if required
- backend/prisma/schema.prisma only if strictly required; prefer existing models.

Constraints:
- Stay on branch task/TASK-016-store-crud.
- Do not mark tasks.json done.
- Do not release lock.
- Do not edit unrelated/frontend files.
- Commit implementation changes.

Required return payload:
- completion status (PASS/BLOCKED)
- summary
- changed files
- implementation commit hash(es)
- tests run with exact commands/results
- acceptance/test-step notes
- blockers or known limitations
