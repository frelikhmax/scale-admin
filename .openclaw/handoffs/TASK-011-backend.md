# TASK-011 backend handoff — password reset flow

Selected by manager after scripted preflight PASS. Implement only TASK-011 on branch `task/TASK-011-password-reset-flow`.

## Task
Реализовать password reset flow с одноразовыми expiring token hash.

## Acceptance criteria
- Пользователь может запросить сброс пароля по email.
- Password reset token хранится только как hash.
- Токен нельзя использовать после expiresAt.
- Токен нельзя использовать повторно.
- После смены пароля обновляется passwordChangedAt.
- Активные сессии пользователя отзываются или становятся недействительными после смены пароля.

## Test steps
1. Запросить password reset для существующего пользователя.
2. Использовать полученный локально или через тестовый SMTP token для смены пароля.
3. Войти с новым паролем и убедиться, что старый пароль не работает.
4. Повторно использовать тот же token и получить отказ.
5. Проверить отказ для просроченного token.

## Agent
backend — this is backend/API/security/server-side auth work.

## Constraints
- Do not mark `tasks.json` done.
- Do not merge.
- Do not delete locks.
- Store only token hashes; never log raw reset tokens or passwords.
- Reuse existing auth, password hashing, CSRF/rate-limit and audit patterns where appropriate.
- Commit implementation changes on the task branch and report exact verification commands/results.
