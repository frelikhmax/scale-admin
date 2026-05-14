import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type UserRoleInput = 'admin' | 'operator';

type SafeUserRecord = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async listUsers(includeDeleted = false) {
    const users = await this.prisma.user.findMany({
      where: includeDeleted ? undefined : { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { emailNormalized: 'asc' }],
    });

    return {
      users: users.map((user) => this.toSafeUser(user)),
    };
  }

  async getUser(userId: string) {
    const user = await this.findUserById(userId, true);
    return { user: this.toSafeUser(user) };
  }

  async changeRole(userId: string, roleInput: string, actorUserId: string, context: RequestContext) {
    const role = this.requireRole(roleInput);
    const user = await this.findUserById(userId, false);
    if (user.role === role) {
      return { user: this.toSafeUser(user), changed: false };
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { role },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'user.role_changed',
          entityType: 'User',
          entityId: user.id,
          beforeData: { role: user.role },
          afterData: { role: updated.role },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    await this.authService.revokeUserSessions(user.id, 'role_changed');

    return { user: this.toSafeUser(updatedUser), changed: true };
  }

  async blockUser(userId: string, actorUserId: string, context: RequestContext) {
    const user = await this.findUserById(userId, false);
    if (user.status === 'blocked') {
      return { user: this.toSafeUser(user), changed: false };
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { status: 'blocked' },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'user.blocked',
          entityType: 'User',
          entityId: user.id,
          beforeData: { status: user.status },
          afterData: { status: updated.status },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    await this.authService.revokeUserSessions(user.id, 'user_blocked');

    return { user: this.toSafeUser(updatedUser), changed: true };
  }

  async unblockUser(userId: string, actorUserId: string, context: RequestContext) {
    const user = await this.findUserById(userId, false);
    if (user.status === 'active') {
      return { user: this.toSafeUser(user), changed: false };
    }

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { status: 'active' },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'user.unblocked',
          entityType: 'User',
          entityId: user.id,
          beforeData: { status: user.status },
          afterData: { status: updated.status },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    return { user: this.toSafeUser(updatedUser), changed: true };
  }

  async softDeleteUser(userId: string, actorUserId: string, context: RequestContext) {
    if (userId === actorUserId) {
      throw new ConflictException('Admins cannot delete their own user');
    }

    const user = await this.findUserById(userId, false);
    const now = new Date();

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { deletedAt: now },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'user.soft_deleted',
          entityType: 'User',
          entityId: user.id,
          beforeData: { deletedAt: user.deletedAt?.toISOString() ?? null },
          afterData: { deletedAt: now.toISOString() },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });

      return updated;
    });

    await this.authService.revokeUserSessions(user.id, 'user_deleted');

    return { user: this.toSafeUser(updatedUser), deleted: true };
  }

  private async findUserById(userId: string, includeDeleted: boolean): Promise<SafeUserRecord> {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private requireRole(role: string): UserRoleInput {
    if (role === 'admin' || role === 'operator') {
      return role;
    }

    throw new BadRequestException('Role must be admin or operator');
  }

  private toSafeUser(user: SafeUserRecord) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() ?? null,
    };
  }
}
