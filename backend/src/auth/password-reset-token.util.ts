import { createHash, randomBytes } from 'node:crypto';

export function createPasswordResetToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashPasswordResetToken(passwordResetToken: string): string {
  return createHash('sha256').update(passwordResetToken, 'utf8').digest('base64url');
}
