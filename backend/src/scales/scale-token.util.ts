import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function createScaleApiToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashScaleApiToken(apiToken: string): string {
  return createHash('sha256').update(apiToken, 'utf8').digest('base64url');
}

export function verifyScaleApiTokenHash(apiToken: string, apiTokenHash: string): boolean {
  const submittedHash = hashScaleApiToken(apiToken);
  const submitted = Buffer.from(submittedHash, 'utf8');
  const expected = Buffer.from(apiTokenHash, 'utf8');

  if (submitted.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(submitted, expected);
}
