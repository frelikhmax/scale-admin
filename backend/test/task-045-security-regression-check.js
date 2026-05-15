const assert = require('node:assert/strict');
const { ForbiddenException, UnauthorizedException } = require('@nestjs/common');
const { AuthService } = require('../dist/auth/auth.service');
const { CsrfGuard } = require('../dist/auth/csrf.guard');
const { CsrfService } = require('../dist/auth/csrf.service');
const { StoreAccessGuard } = require('../dist/auth/store-access.guard');
const { AuditLogService } = require('../dist/logs/audit-log.service');
const { ScalesService } = require('../dist/scales/scales.service');
const { hashScaleApiToken } = require('../dist/scales/scale-token.util');

const userId = '11111111-1111-4111-8111-111111111111';
const sessionId = '22222222-2222-4222-8222-222222222222';
const allowedStoreId = '33333333-3333-4333-8333-333333333333';
const foreignStoreId = '44444444-4444-4444-8444-444444444444';
const scaleDeviceId = '55555555-5555-4555-8555-555555555555';
const apiToken = 'task_045_plain_scale_token';

function configService(nodeEnv = 'production') {
  return {
    getOrThrow(key) {
      assert.equal(key, 'app');
      return {
        nodeEnv,
        sessionCookieName: 'scale_admin_session',
        csrfCookieName: 'scale_admin_csrf',
        csrfHeaderName: 'x-csrf-token',
        sessionIdleTimeoutMinutes: 30,
        sessionAbsoluteTimeoutDays: 7,
        passwordResetTokenTtlMinutes: 15,
        authFailedLoginMaxAttempts: 5,
        authFailedLoginLockMinutes: 10,
      };
    },
  };
}

function executionContext(request, handler = () => {}, clazz = class TestController {}) {
  return {
    getHandler: () => handler,
    getClass: () => clazz,
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

function reflector(metadataValue) {
  return { getAllAndOverride: () => metadataValue };
}

async function assertRejectsWith(fn, ExceptionClass, message) {
  await assert.rejects(fn, (error) => {
    assert(error instanceof ExceptionClass, message || `expected ${ExceptionClass.name}, got ${error?.constructor?.name}`);
    return true;
  });
}

async function testOperatorCannotAccessForeignStore() {
  const prisma = {
    userStoreAccess: {
      findFirst: async ({ where, select }) => {
        assert.deepEqual(select, { id: true });
        assert.equal(where.userId, userId);
        assert.equal(where.revokedAt, null);
        return where.storeId === allowedStoreId ? { id: 'access-1' } : null;
      },
    },
  };
  const auth = new AuthService(prisma, { create: async () => undefined }, configService());
  assert.equal(await auth.canAccessStore(userId, 'operator', allowedStoreId), true);
  assert.equal(await auth.canAccessStore(userId, 'operator', foreignStoreId), false);

  const guard = new StoreAccessGuard(reflector({ field: 'storeId', source: 'params' }), auth);
  const request = { user: { id: userId, role: 'operator' }, params: { storeId: foreignStoreId } };
  await assertRejectsWith(() => guard.canActivate(executionContext(request)), ForbiddenException, 'foreign store direct API request must be forbidden');
}

async function testBlockedUserCannotLoginOrKeepOldSession() {
  const auditLogs = [];
  const revokedSessions = [];
  const prisma = {
    user: {
      findFirst: async () => ({
        id: userId,
        email: 'blocked@example.test',
        emailNormalized: 'blocked@example.test',
        fullName: 'Blocked User',
        role: 'operator',
        status: 'blocked',
        deletedAt: null,
        credential: { failedLoginCount: 0, lockedUntil: null },
      }),
    },
    userSession: {
      findUnique: async () => ({
        id: sessionId,
        userId,
        createdAt: new Date(Date.now() - 60_000),
        lastUsedAt: new Date(Date.now() - 30_000),
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
        user: {
          id: userId,
          email: 'blocked@example.test',
          fullName: 'Blocked User',
          role: 'operator',
          status: 'blocked',
          deletedAt: null,
        },
      }),
      update: async ({ where, data }) => {
        revokedSessions.push({ where, data });
        return { id: where.id, ...data };
      },
      create: async () => {
        throw new Error('blocked login must not create sessions');
      },
    },
  };
  const audit = { create: async (clientOrArgs, maybeArgs) => auditLogs.push(maybeArgs ?? clientOrArgs) };
  const auth = new AuthService(prisma, audit, configService());

  await assertRejectsWith(
    () => auth.login('blocked@example.test', 'irrelevant-password', { ipAddress: '127.0.0.1', userAgent: 'task-045' }),
    UnauthorizedException,
    'blocked user login must fail',
  );
  assert.equal(auditLogs[0].data.action, 'auth.login_failed');
  assert.equal(auditLogs[0].data.metadata.reason, 'invalid_credentials');

  await assertRejectsWith(() => auth.getCurrentSession('old-active-session-token'), UnauthorizedException, 'blocked old session must fail');
  assert.equal(revokedSessions.length, 1);
  assert.equal(revokedSessions[0].where.id, sessionId);
  assert.equal(revokedSessions[0].data.revokedReason, 'user_inactive');
}

function testCsrfGuard() {
  const csrf = new CsrfService(configService());
  const guard = new CsrfGuard(csrf, reflector(false));
  assert.equal(guard.canActivate(executionContext({ method: 'GET', headers: {} })), true);

  assert.throws(
    () => guard.canActivate(executionContext({ method: 'POST', headers: {} })),
    (error) => error instanceof ForbiddenException && error.response?.code === 'CSRF_TOKEN_INVALID',
  );

  const token = csrf.issueToken();
  assert.equal(
    guard.canActivate(
      executionContext({
        method: 'PATCH',
        headers: {
          cookie: `${csrf.getCookieName()}=${encodeURIComponent(token)}`,
          [csrf.getHeaderName()]: token,
        },
      }),
    ),
    true,
  );
}

function testProductionCookieAttributes() {
  const auth = new AuthService({}, { create: async () => undefined }, configService('production'));
  assert.deepEqual(auth.getCookieOptions(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function testSecretsAreRedactedAndNotExposedInLogs() {
  const storedAuditLogs = [];
  const auditService = new AuditLogService({
    auditLog: {
      create: async ({ data }) => {
        storedAuditLogs.push(data);
        return data;
      },
    },
  });

  await auditService.create({
    data: {
      action: 'security.redaction_test',
      entityType: 'SecurityRegression',
      beforeData: { sessionToken: 'session-secret', nested: { api_token: 'api-secret' } },
      afterData: { message: `resetToken=reset-secret apiToken=${apiToken}` },
      metadata: { inviteToken: 'invite-secret', password: 'password-secret', tokenHash: 'hash-secret' },
    },
  });
  const auditJson = JSON.stringify(storedAuditLogs);
  for (const secret of ['session-secret', 'api-secret', 'reset-secret', apiToken, 'invite-secret', 'password-secret', 'hash-secret']) {
    assert.equal(auditJson.includes(secret), false, `audit log leaked ${secret}`);
  }
  assert(auditJson.includes('[REDACTED]'), 'audit log should retain redaction markers');

  const prisma = {
    user: { findFirst: async () => null },
  };
  const auth = new AuthService(prisma, auditService, configService('production'));
  const passwordResetResponse = await auth.requestPasswordReset('missing@example.test', { ipAddress: '127.0.0.1' });
  assert.equal('token' in passwordResetResponse, false, 'password reset endpoint must not return reset token in production');

  const logsServiceSource = require('node:fs').readFileSync(require('node:path').join(__dirname, '../src/logs/logs.service.ts'), 'utf8');
  assert.equal(logsServiceSource.includes('beforeData: true'), false, 'frontend-visible audit log API must not select beforeData');
  assert.equal(logsServiceSource.includes('afterData: true'), false, 'frontend-visible audit log API must not select afterData');
  assert.equal(logsServiceSource.includes('metadata: true'), false, 'frontend-visible audit log API must not select metadata');
  assert.equal(logsServiceSource.includes('requestIp: true'), false, 'frontend-visible scale sync log API must not select requestIp');
  assert.equal(logsServiceSource.includes('userAgent: true'), false, 'frontend-visible scale sync log API must not select userAgent');
}

async function testScaleApiRejectsInvalidTokenAndInactiveDevices() {
  const syncLogs = [];
  const prisma = {
    scaleDevice: {
      findUnique: async ({ where }) => ({
        id: scaleDeviceId,
        storeId: allowedStoreId,
        deviceCode: where.deviceCode,
        apiTokenHash: hashScaleApiToken(apiToken),
        status: where.deviceCode === 'BLOCKED-SCALE' ? 'blocked' : 'active',
      }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
    },
    scaleSyncLog: {
      create: async ({ data }) => {
        syncLogs.push(data);
        return data;
      },
    },
  };
  const service = new ScalesService(prisma);

  const invalidResult = await service.authenticateScaleApiRequest('ACTIVE-SCALE', 'wrong-token', {
    ipAddress: '127.0.0.1',
    userAgent: 'task-045',
  });
  assert.deepEqual(invalidResult, { authenticated: false });
  assert.equal(syncLogs.at(-1).status, 'auth_failed');
  assert.equal(syncLogs.at(-1).errorMessage, 'invalid_credentials');
  assert.equal(JSON.stringify(syncLogs).includes('wrong-token'), false, 'invalid scale token must not be logged');

  await assertRejectsWith(
    () => service.authenticateScaleApiRequest('BLOCKED-SCALE', apiToken, { ipAddress: '127.0.0.1', userAgent: 'task-045' }),
    ForbiddenException,
    'blocked scale device must be rejected',
  );
  assert.equal(syncLogs.at(-1).status, 'auth_failed');
  assert.equal(syncLogs.at(-1).errorMessage, 'device_blocked');

  const okResult = await service.authenticateScaleApiRequest('ACTIVE-SCALE', apiToken, { ipAddress: '127.0.0.1' });
  assert.equal(okResult.authenticated, true);
  assert.equal(okResult.device.status, 'active');
}

(async () => {
  await testOperatorCannotAccessForeignStore();
  await testBlockedUserCannotLoginOrKeepOldSession();
  testCsrfGuard();
  testProductionCookieAttributes();
  await testSecretsAreRedactedAndNotExposedInLogs();
  await testScaleApiRejectsInvalidTokenAndInactiveDevices();
  console.log('TASK_045_SECURITY_REGRESSION_CHECK=PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
