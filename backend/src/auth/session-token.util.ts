import { createHash, randomBytes } from 'node:crypto';

export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(sessionToken: string): string {
  return createHash('sha256').update(sessionToken, 'utf8').digest('base64url');
}
