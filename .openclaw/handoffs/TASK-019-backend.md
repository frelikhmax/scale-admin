# Handoff: TASK-019 — backend

## Task
Реализовать регистрацию, блокировку и перевыпуск apiToken для ScaleDevice

## Selected agent
backend

## Branch
`task/TASK-019-scale-device-tokens`

## Dependencies
TASK-016, TASK-008

## Acceptance criteria
- Admin может зарегистрировать весы для магазина
- deviceCode уникален
- apiToken показывается только один раз при создании или regeneration
- В базе хранится только apiTokenHash
- Admin может заблокировать или деактивировать весы
- Regeneration старого token делает старый token недействительным
- Операции с устройствами пишутся в AuditLog без секретов

## Required test steps
- Шаг 1: Под admin создать ScaleDevice и сохранить показанный apiToken
- Шаг 2: Проверить в базе, что plain apiToken не хранится
- Шаг 3: Заблокировать устройство и проверить статус
- Шаг 4: Выполнить regeneration token и убедиться, что новый token показан один раз
- Шаг 5: Проверить AuditLog и отсутствие secret-значений в логах


## Workflow constraints
- Work only on this task and this branch.
- Do not mark `tasks.json` done.
- Do not remove or release the lock.
- Commit implementation changes with a clear message.
- Run focused backend tests/build/Prisma checks and any task-specific API checks you can.
- Report: commits, changed files, exact tests/results, known limitations/blockers.
- Do not log or expose plaintext `apiToken` beyond the one-time create/regenerate API response.

## Scope guidance
Implement backend support for ScaleDevice registration, status/block/deactivation management, token hashing and regeneration, uniqueness, access control, and AuditLog entries with secret redaction.
