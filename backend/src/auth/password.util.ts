import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const PBKDF2_SHA512_ALGORITHM = 'pbkdf2_sha512';
const PBKDF2_SHA512_ITERATIONS = 210_000;
const PBKDF2_SHA512_KEY_LENGTH = 64;
const PBKDF2_SHA512_DIGEST = 'sha512';

type PasswordHashParams = {
  salt?: unknown;
  iterations?: unknown;
  keyLength?: unknown;
  digest?: unknown;
};

export function hashPassword(password: string) {
  const salt = randomBytes(32);
  const hash = pbkdf2Sync(password, salt, PBKDF2_SHA512_ITERATIONS, PBKDF2_SHA512_KEY_LENGTH, PBKDF2_SHA512_DIGEST);

  return {
    passwordHash: hash.toString('base64'),
    passwordHashAlgorithm: PBKDF2_SHA512_ALGORITHM,
    passwordHashParams: {
      salt: salt.toString('base64'),
      iterations: PBKDF2_SHA512_ITERATIONS,
      keyLength: PBKDF2_SHA512_KEY_LENGTH,
      digest: PBKDF2_SHA512_DIGEST,
      encoding: 'base64',
    },
  };
}

export function verifyPassword(password: string, credential: { passwordHash: string; passwordHashAlgorithm: string; passwordHashParams: unknown }): boolean {
  if (credential.passwordHashAlgorithm !== PBKDF2_SHA512_ALGORITHM) {
    return false;
  }

  const params = credential.passwordHashParams as PasswordHashParams | null;
  if (!params || typeof params.salt !== 'string') {
    return false;
  }

  const iterations = Number(params.iterations);
  const keyLength = Number(params.keyLength);
  const digest = typeof params.digest === 'string' ? params.digest : 'sha512';

  if (!Number.isInteger(iterations) || iterations < 1 || !Number.isInteger(keyLength) || keyLength < 1) {
    return false;
  }

  try {
    const expectedHash = Buffer.from(credential.passwordHash, 'base64');
    const actualHash = pbkdf2Sync(password, Buffer.from(params.salt, 'base64'), iterations, keyLength, digest);

    return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
  } catch {
    return false;
  }
}
