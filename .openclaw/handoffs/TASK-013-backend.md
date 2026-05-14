# TASK-013 — backend handoff

Owner: backend
Branch: task/TASK-013-operator-store-access-management

## Task
Реализовать управление доступами operator к магазинам.

## Why backend
This is backend/API/domain/security work: admin-only grant/revoke of UserStoreAccess, no duplicate active access for userId + storeId, operator store visibility from backend access rules, and AuditLog entries.

## Source of truth
Read before editing:
- `/home/clawd/projects/scale-admin/PRD.md`
- `/home/clawd/projects/scale-admin/tasks.json`
- `/home/clawd/projects/scale-admin/progress.md`
- Recent git history: `git log --oneline -20`

Relevant PRD sections:
- 6.1 Authorization, sessions and roles
- 6.2 Users and access
- 6.3 Stores
- 7.4 UserStoreAccess
- 11.4 Authorization / store access if present

## Acceptance criteria
- Admin может назначить operator доступ к магазину.
- Admin может отозвать доступ, заполнив revokedAt.
- Нельзя создать дубль активного доступа userId + storeId.
- Operator видит только магазины с активным доступом.
- Выдача и отзыв доступа пишутся в AuditLog.

## Required test steps
1. Назначить operator доступ к магазину.
2. Проверить, что operator видит этот магазин в API.
3. Повторно назначить тот же доступ и получить отказ или idempotent-результат без дубля.
4. Отозвать доступ и проверить, что operator больше не видит магазин.
5. Проверить AuditLog по выдаче и отзыву.

Also run:
- `cd backend && npm run build`
- Prisma validation/generation if schema or Prisma usage changes.
- Focused HTTP/curl or automated checks needed to prove the acceptance criteria.

## Constraints
- Work only on this task branch.
- Do not checkout main.
- Do not create another branch.
- Do not merge branches.
- Commit implementation changes only on the assigned task branch.
- Do not mark `tasks.json` done.
- Do not edit unrelated tasks.
- Keep secrets redacted from logs and responses.
- Do not use tester/reviewer.
- Do not implement frontend UI.

## Required ACK
Reply first with exactly:

```text
ACK_TASK-013_RECEIVED
handoff_read: yes
will_not_mark_tasks_json_done: yes
blocked: no
```

Then continue implementation immediately unless blocked.

## Final report requirements
Final report must include:
- Summary
- Current branch
- Files changed
- Commits, including implementation commit hash
- Tests run
- Test results
- Exact outputs/URLs/headers where relevant
- Scope check
- Known limitations
- Blockers, if any
- Whether tasks.json was changed
- Explicit statement: `tasks.json was not marked done by me.`
