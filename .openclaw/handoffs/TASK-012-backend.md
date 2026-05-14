# TASK-012 — backend handoff

Owner: backend
Branch: task/TASK-012-admin-users-crud

## Task
Реализовать admin CRUD для пользователей, ролей, block и soft delete.

## Why backend
This task is API/domain/security implementation: admin-only user management, RBAC/session interaction, audit logging, and login behavior for blocked/deleted users. No UI scope is required.

## Acceptance criteria
- Admin видит список пользователей с ролями и статусами.
- Admin может менять роль пользователя между admin и operator.
- Admin может блокировать пользователя.
- Admin может выполнить soft delete через deletedAt.
- Blocked или deleted пользователь не может войти.
- Все изменения пользователей пишутся в AuditLog.

## Required test steps
1. Под admin открыть список пользователей через API.
2. Изменить роль тестового пользователя и проверить новое значение.
3. Заблокировать пользователя и проверить, что login запрещён.
4. Выполнить soft delete и убедиться, что пользователь исключён из активного списка.
5. Проверить AuditLog по всем операциям.

## Constraints
- Work only on this task branch.
- Do not mark tasks.json status done.
- Do not edit unrelated tasks.
- Keep secrets redacted from logs and responses.
- Commit implementation changes when complete and report commit hash plus exact checks run.
