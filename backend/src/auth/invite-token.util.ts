import { createHash, randomBytes } from 'node:crypto';

export function createInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashInviteToken(inviteToken: string): string {
  return createHash('sha256').update(inviteToken, 'utf8').digest('base64url');
}
