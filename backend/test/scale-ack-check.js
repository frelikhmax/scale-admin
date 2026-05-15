const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ScalesService } = require('../dist/scales/scales.service');

const storeId = '11111111-1111-4111-8111-111111111111';
const deviceId = '22222222-2222-4222-8222-222222222222';
const versionId = '33333333-3333-4333-8333-333333333333';
const previousVersionId = '44444444-4444-4444-8444-444444444444';
const apiToken = 'scale_plaintext_secret_for_test';

function createMockPrisma() {
  const state = {
    device: {
      id: deviceId,
      storeId,
      currentCatalogVersionId: previousVersionId,
      lastSyncAt: null,
    },
    version: {
      id: versionId,
      storeId,
      versionNumber: 8,
      packageChecksum: 'published-checksum',
    },
    logs: [],
    auditLogs: [],
  };

  const tx = {
    scaleDevice: {
      update: async ({ where, data }) => {
        assert.equal(where.id, deviceId);
        Object.assign(state.device, data);
        return { ...state.device };
      },
    },
    scaleSyncLog: {
      create: async ({ data }) => {
        const log = { id: `log-${state.logs.length + 1}`, ...data, createdAt: new Date() };
        state.logs.push(log);
        return log;
      },
    },
    auditLog: {
      create: async ({ data }) => {
        const auditLog = { id: `audit-${state.auditLogs.length + 1}`, ...data, createdAt: new Date() };
        state.auditLogs.push(auditLog);
        return auditLog;
      },
    },
  };

  return {
    state,
    catalogVersion: {
      findFirst: async ({ where, select }) => {
        assert.deepEqual(where, { id: versionId, storeId });
        assert.deepEqual(select, { id: true, versionNumber: true, packageChecksum: true });
        return { ...state.version };
      },
    },
    $transaction: async (callback) => callback(tx),
  };
}

async function testSuccessAckUpdatesDeviceLogsAndAudits() {
  const prisma = createMockPrisma();
  const service = new ScalesService(prisma);
  const result = await service.acknowledgeScaleCatalogVersion(
    { id: deviceId, storeId },
    { versionId, status: 'success', apiToken },
    { ipAddress: '127.0.0.1', userAgent: 'scale-test' },
  );

  assert.equal(result.acknowledged, true);
  assert.equal(result.status, 'success');
  assert.equal(result.versionId, versionId);
  assert.ok(result.lastSyncAt, 'success ACK response includes lastSyncAt');
  assert.equal(prisma.state.device.currentCatalogVersionId, versionId);
  assert.ok(prisma.state.device.lastSyncAt instanceof Date, 'success ACK updates lastSyncAt');

  assert.equal(prisma.state.logs.length, 1);
  assert.equal(prisma.state.logs[0].status, 'ack_received');
  assert.equal(prisma.state.logs[0].deliveredVersionId, versionId);
  assert.equal(prisma.state.logs[0].errorMessage, null);
  assert.equal(prisma.state.logs[0].requestIp, '127.0.0.1');
  assert.equal(prisma.state.logs[0].userAgent, 'scale-test');

  assert.equal(prisma.state.auditLogs.length, 1);
  assert.equal(prisma.state.auditLogs[0].actorUserId, null);
  assert.equal(prisma.state.auditLogs[0].action, 'scale_device.catalog_version_acknowledged');
  assert.equal(prisma.state.auditLogs[0].metadata.versionId, versionId);
  assert.equal(JSON.stringify({ logs: prisma.state.logs, auditLogs: prisma.state.auditLogs, result }).includes(apiToken), false, 'ACK logs/audit/response must not contain plaintext apiToken');
}

async function testErrorAckDoesNotMarkSuccessfulSync() {
  const prisma = createMockPrisma();
  const service = new ScalesService(prisma);
  const result = await service.acknowledgeScaleCatalogVersion(
    { id: deviceId, storeId },
    { versionId, status: 'error', errorMessage: `failed apiToken=${apiToken}` },
    { ipAddress: '127.0.0.2', userAgent: 'scale-test-error' },
  );

  assert.deepEqual(result, { acknowledged: true, status: 'error', versionId, lastSyncAt: null });
  assert.equal(prisma.state.device.currentCatalogVersionId, previousVersionId, 'error ACK must not update currentCatalogVersionId');
  assert.equal(prisma.state.device.lastSyncAt, null, 'error ACK must not update lastSyncAt');

  assert.equal(prisma.state.logs.length, 1);
  assert.equal(prisma.state.logs[0].status, 'error');
  assert.equal(prisma.state.logs[0].deliveredVersionId, versionId);
  assert.equal(prisma.state.logs[0].errorMessage, 'failed apiToken=[REDACTED]');
  assert.equal(prisma.state.auditLogs.length, 0, 'error ACK must not write success audit log');
  assert.equal(JSON.stringify({ logs: prisma.state.logs, auditLogs: prisma.state.auditLogs, result }).includes(apiToken), false, 'ACK logs/audit/response must redact plaintext apiToken');
}

function testPublicRouteIsExposedAtRequiredPath() {
  const controller = fs.readFileSync(path.join(__dirname, '../src/scales/scale-api.controller.ts'), 'utf8');
  assert(controller.includes("@Post('scales/ack')"), 'POST /api/scales/ack must be exposed');
}

(async () => {
  await testSuccessAckUpdatesDeviceLogsAndAudits();
  await testErrorAckDoesNotMarkSuccessfulSync();
  testPublicRouteIsExposedAtRequiredPath();
  console.log('SCALE_ACK_CHECK=PASS');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
