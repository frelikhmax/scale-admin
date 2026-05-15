import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_METADATA = 'auth:skipCsrf';

export function SkipCsrf() {
  return SetMetadata(SKIP_CSRF_METADATA, true);
}
