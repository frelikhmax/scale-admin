import { SetMetadata } from '@nestjs/common';
import type { UserRole } from './auth.types';

export const AUTH_ROLES_METADATA = 'auth:roles';

export function RequireRoles(...roles: UserRole[]) {
  return SetMetadata(AUTH_ROLES_METADATA, roles);
}
