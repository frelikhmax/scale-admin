import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfiguration } from '../config/app.config';

export type RateLimitCheck = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type BucketState = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitService {
  private readonly appConfig: AppConfiguration;
  private readonly buckets = new Map<string, BucketState>();

  constructor(configService: ConfigService) {
    this.appConfig = configService.getOrThrow<AppConfiguration>('app');
  }

  check(bucket: string, key: string, maxAttempts?: number, windowSeconds?: number): RateLimitCheck {
    const limit = maxAttempts ?? this.defaultMaxAttempts(bucket);
    const windowMs = (windowSeconds ?? this.appConfig.authRateLimitWindowSeconds) * 1000;
    const now = Date.now();
    const storageKey = `${bucket}:${key}`;
    const existing = this.buckets.get(storageKey);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(storageKey, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0, remaining: Math.max(limit - 1, 0) };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
        remaining: 0,
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(limit - existing.count, 0),
    };
  }

  private defaultMaxAttempts(bucket: string): number {
    if (bucket === 'login') {
      return this.appConfig.authLoginRateLimitMax;
    }

    return this.appConfig.authActionRateLimitMax;
  }
}
