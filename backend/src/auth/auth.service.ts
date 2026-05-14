import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfiguration } from '../config/app.config';
import { verifyPassword } from './password.util';
import { createSessionToken, hashSessionToken } from './session-token.util';

type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
};

type CookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict';
  secure: boolean;
  path: string;
  maxAge: number;
};

@Injectable()
export class AuthService {
  private readonly appConfig: AppConfiguration;
  private readonly idleTimeoutMs: number;
  private readonly absoluteTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    this.appConfig = configService.getOrThrow<AppConfiguration>('app');
    this.idleTimeoutMs = this.appConfig.sessionIdleTimeoutMinutes * 60 * 1000;
    this.absoluteTimeoutMs = this.appConfig.sessionAbsoluteTimeoutDays * 24 * 60 * 60 * 1000;
  }

  getCookieName(): string {
    return this.appConfig.sessionCookieName;
  }

  getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.appConfig.nodeEnv === 'production',
      path: '/',
      maxAge: this.absoluteTimeoutMs,
    };
  }

  getClearCookieOptions(): Omit<CookieOptions, 'maxAge'> {
    const { maxAge: _maxAge, ...options } = this.getCookieOptions();
    return options;
  }

  async login(email: string, password: string, context: RequestContext) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail || typeof password !== 'string' || password.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        emailNormalized: normalizedEmail,
        deletedAt: null,
      },
      include: {
        credential: true,
      },
    });

    if (!user || user.status !== 'active' || !user.credential) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.credential.lockedUntil && user.credential.lockedUntil > new Date()) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = verifyPassword(password, user.credential);
    if (!passwordValid) {
      await this.prisma.userCredential.update({
        where: { userId: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lastFailedLoginAt: new Date(),
        },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const now = new Date();
    const sessionToken = createSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(now.getTime() + this.absoluteTimeoutMs);

    await this.prisma.$transaction([
      this.prisma.userCredential.update({
        where: { userId: user.id },
        data: {
          failedLoginCount: 0,
          lastFailedLoginAt: null,
          lockedUntil: null,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now },
      }),
      this.prisma.userSession.create({
        data: {
          userId: user.id,
          sessionTokenHash,
          createdAt: now,
          lastUsedAt: now,
          expiresAt,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      }),
    ]);

    return {
      sessionToken,
      cookieName: this.getCookieName(),
      cookieOptions: this.getCookieOptions(),
      user: this.toSafeUser(user),
      expiresAt,
    };
  }

  async getCurrentSession(sessionToken: string | undefined) {
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication required');
    }

    const sessionTokenHash = hashSessionToken(sessionToken);
    const session = await this.prisma.userSession.findUnique({
      where: { sessionTokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Authentication required');
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      await this.revokeSessionById(session.id, 'absolute_timeout');
      throw new UnauthorizedException('Authentication required');
    }

    const lastUsedAt = session.lastUsedAt ?? session.createdAt;
    if (now.getTime() - lastUsedAt.getTime() > this.idleTimeoutMs) {
      await this.revokeSessionById(session.id, 'idle_timeout');
      throw new UnauthorizedException('Authentication required');
    }

    if (session.user.deletedAt || session.user.status !== 'active') {
      await this.revokeSessionById(session.id, 'user_inactive');
      throw new UnauthorizedException('Authentication required');
    }

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    });

    return {
      session: {
        createdAt: session.createdAt,
        lastUsedAt: now,
        expiresAt: session.expiresAt,
      },
      user: this.toSafeUser(session.user),
    };
  }

  async logout(sessionToken: string | undefined): Promise<boolean> {
    if (!sessionToken) {
      return false;
    }

    const sessionTokenHash = hashSessionToken(sessionToken);
    const session = await this.prisma.userSession.findUnique({ where: { sessionTokenHash } });
    if (!session || session.revokedAt) {
      return false;
    }

    await this.revokeSessionById(session.id, 'logout');
    return true;
  }

  private async revokeSessionById(sessionId: string, revokedReason: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
        revokedReason,
      },
    });
  }

  private normalizeEmail(email: string): string {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  private toSafeUser(user: { id: string; email: string; fullName: string; role: string; status: string }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
  }
}
