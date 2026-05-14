import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_METADATA = 'auth:rateLimit';

export type RateLimitRequirement = {
  bucket: 'login' | 'password-reset' | 'invite-accept' | string;
  maxAttempts?: number;
  windowSeconds?: number;
};

export function RateLimit(requirement: RateLimitRequirement) {
  return SetMetadata(RATE_LIMIT_METADATA, requirement);
}
