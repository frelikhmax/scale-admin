import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createScaleApiToken, hashScaleApiToken, verifyScaleApiTokenHash } from './scale-token.util';

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type CreateScaleDeviceInput = {
  deviceCode: string;
  name: string;
  model?: string;
  status?: string;
};

export type UpdateScaleDeviceStatusInput = {
  status: string;
};

export type ScaleApiAuthResult =
  | {
      authenticated: true;
      device: {
        id: string;
        storeId: string;
        deviceCode: string;
        status: string;
      };
    }
  | { authenticated: false };

type ScaleDeviceRecord = {
  id: string;
  storeId: string;
  deviceCode: string;
  apiTokenHash: string;
  name: string;
  model: string | null;
  status: string;
  lastSeenAt: Date | null;
  lastSyncAt: Date | null;
  currentCatalogVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ScalesService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(storeId: string, input: CreateScaleDeviceInput, actorUserId: string, context: RequestContext) {
    const store = await this.findStoreById(storeId);
    const deviceCode = this.requireDeviceCode(input.deviceCode);
    const name = this.requireName(input.name);
    const model = this.normalizeOptionalString(input.model);
    const status = this.requireDeviceStatus(input.status ?? 'active');

    const apiToken = createScaleApiToken();
    const apiTokenHash = hashScaleApiToken(apiToken);

    try {
      const device = await this.prisma.$transaction(async (tx) => {
        const created = await tx.scaleDevice.create({
          data: {
            storeId: store.id,
            deviceCode,
            apiTokenHash,
            name,
            model,
            status,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'scale_device.created',
            entityType: 'ScaleDevice',
            entityId: created.id,
            storeId: store.id,
            afterData: {
              storeId: store.id,
              deviceCode: created.deviceCode,
              name: created.name,
              model: created.model,
              status: created.status,
              apiTokenIssued: true,
            },
            metadata: {
              storeCode: store.code,
              tokenIssued: true,
            },
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          },
        });

        return created;
      });

      return {
        device: this.toDeviceResponse(device),
        apiToken,
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Scale device code already exists');
      }

      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, input: UpdateScaleDeviceStatusInput, actorUserId: string, context: RequestContext) {
    const device = await this.findDeviceById(deviceId);
    const status = this.requireDeviceStatus(input.status);

    if (device.status === status) {
      return { device: this.toDeviceResponse(device), changed: false };
    }

    const updatedDevice = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.scaleDevice.update({
        where: { id: device.id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'scale_device.status_changed',
          entityType: 'ScaleDevice',
          entityId: device.id,
          storeId: device.storeId,
          beforeData: { status: device.status },
          afterData: { status: updated.status },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    return { device: this.toDeviceResponse(updatedDevice), changed: true };
  }

  async regenerateApiToken(deviceId: string, actorUserId: string, context: RequestContext) {
    const device = await this.findDeviceById(deviceId);
    const apiToken = createScaleApiToken();
    const apiTokenHash = hashScaleApiToken(apiToken);

    const updatedDevice = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.scaleDevice.update({
        where: { id: device.id },
        data: { apiTokenHash },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'scale_device.api_token_regenerated',
          entityType: 'ScaleDevice',
          entityId: device.id,
          storeId: device.storeId,
          beforeData: { tokenRotated: true },
          afterData: { tokenIssued: true },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    return {
      device: this.toDeviceResponse(updatedDevice),
      apiToken,
    };
  }

  async authenticateScaleApiRequest(deviceCode: string, apiToken: string, context: RequestContext): Promise<ScaleApiAuthResult> {
    const normalizedDeviceCode = typeof deviceCode === 'string' ? deviceCode.trim().toUpperCase() : '';
    const submittedToken = typeof apiToken === 'string' ? apiToken : '';

    if (!normalizedDeviceCode || !submittedToken) {
      await this.writeScaleAuthFailureLog(null, null, 'missing_credentials', context);
      return { authenticated: false };
    }

    const device = await this.prisma.scaleDevice.findUnique({ where: { deviceCode: normalizedDeviceCode } });
    if (!device) {
      await this.writeScaleAuthFailureLog(null, null, 'invalid_credentials', context);
      return { authenticated: false };
    }

    if (!verifyScaleApiTokenHash(submittedToken, device.apiTokenHash)) {
      await this.writeScaleAuthFailureLog(device.id, device.storeId, 'invalid_credentials', context);
      return { authenticated: false };
    }

    if (device.status !== 'active') {
      await this.writeScaleAuthFailureLog(device.id, device.storeId, `device_${device.status}`, context);
      throw new ForbiddenException({
        message: 'Scale device is not allowed to sync',
        error: 'Forbidden',
        code: 'SCALE_DEVICE_NOT_ACTIVE',
        statusCode: 403,
      });
    }

    await this.prisma.scaleDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    return {
      authenticated: true,
      device: {
        id: device.id,
        storeId: device.storeId,
        deviceCode: device.deviceCode,
        status: device.status,
      },
    };
  }

  getScaleApiAuthCheck(device: { id: string; storeId: string; deviceCode: string; status: string }) {
    return {
      authenticated: true,
      device: {
        id: device.id,
        storeId: device.storeId,
        deviceCode: device.deviceCode,
        status: device.status,
      },
    };
  }

  async getScaleApiNoUpdateResponse(device: { id: string; storeId: string }, currentCatalogVersionId?: string) {
    const updatedDevice = await this.prisma.scaleDevice.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(),
        lastSyncAt: new Date(),
      },
    });

    await this.prisma.scaleSyncLog.create({
      data: {
        scaleDeviceId: device.id,
        storeId: device.storeId,
        requestedVersionId: currentCatalogVersionId || null,
        status: 'no_update',
        errorMessage: null,
      },
    });

    return {
      status: 'no_update',
      deviceId: updatedDevice.id,
      package: null,
    };
  }

  private async writeScaleAuthFailureLog(
    scaleDeviceId: string | null,
    storeId: string | null,
    reason: 'missing_credentials' | 'invalid_credentials' | string,
    context: RequestContext,
  ) {
    await this.prisma.scaleSyncLog.create({
      data: {
        scaleDeviceId,
        storeId,
        status: 'auth_failed',
        errorMessage: reason,
        requestIp: context.ipAddress,
        userAgent: context.userAgent,
      },
    });
  }

  private async findStoreById(storeId: string) {
    if (!storeId) {
      throw new BadRequestException('Store id is required');
    }

    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store || store.status === 'archived') {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  private async findDeviceById(deviceId: string): Promise<ScaleDeviceRecord> {
    if (!deviceId) {
      throw new BadRequestException('Scale device id is required');
    }

    const device = await this.prisma.scaleDevice.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Scale device not found');
    }

    return device;
  }

  private requireDeviceCode(deviceCode: string): string {
    const normalizedCode = typeof deviceCode === 'string' ? deviceCode.trim().toUpperCase() : '';
    if (!normalizedCode || normalizedCode.length > 128) {
      throw new BadRequestException('Device code is required and must be at most 128 characters');
    }

    return normalizedCode;
  }

  private requireName(name: string): string {
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    if (!normalizedName || normalizedName.length > 255) {
      throw new BadRequestException('Device name is required and must be at most 255 characters');
    }

    return normalizedName;
  }

  private requireDeviceStatus(status: string): 'active' | 'inactive' | 'blocked' | 'archived' {
    if (status === 'active' || status === 'inactive' || status === 'blocked' || status === 'archived') {
      return status;
    }

    throw new BadRequestException('Scale device status must be active, inactive, blocked, or archived');
  }

  private normalizeOptionalString(value: string | undefined): string | null {
    const normalizedValue = typeof value === 'string' ? value.trim() : '';
    return normalizedValue || null;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private toDeviceResponse(device: ScaleDeviceRecord) {
    return {
      id: device.id,
      storeId: device.storeId,
      deviceCode: device.deviceCode,
      name: device.name,
      model: device.model,
      status: device.status,
      lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
      lastSyncAt: device.lastSyncAt?.toISOString() ?? null,
      currentCatalogVersionId: device.currentCatalogVersionId,
      createdAt: device.createdAt.toISOString(),
      updatedAt: device.updatedAt.toISOString(),
    };
  }
}
