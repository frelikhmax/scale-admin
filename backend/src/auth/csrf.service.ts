import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfiguration } from '../config/app.config';

export type CsrfCookieOptions = {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict';
  secure: boolean;
  path: string;
  maxAge: number;
};

@Injectable()
export class CsrfService {
  private readonly appConfig: AppConfiguration;
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  constructor(configService: ConfigService) {
    this.appConfig = configService.getOrThrow<AppConfiguration>('app');
  }

  getCookieName(): string {
    return this.appConfig.csrfCookieName;
  }

  getHeaderName(): string {
    return this.appConfig.csrfHeaderName;
  }

  getCookieOptions(): CsrfCookieOptions {
    return {
      httpOnly: false,
      sameSite: 'lax',
      secure: this.appConfig.nodeEnv === 'production',
      path: '/',
      maxAge: this.tokenTtlMs,
    };
  }

  issueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  tokensMatch(cookieToken: string | undefined, headerToken: string | undefined): boolean {
    if (!cookieToken || !headerToken) {
      return false;
    }

    const cookieTokenBuffer = Buffer.from(cookieToken);
    const headerTokenBuffer = Buffer.from(headerToken);
    return cookieTokenBuffer.length === headerTokenBuffer.length && timingSafeEqual(cookieTokenBuffer, headerTokenBuffer);
  }
}
