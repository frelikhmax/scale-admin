import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RequireRoles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { RequireStoreAccess } from '../auth/store-access.decorator';
import { StoreAccessGuard } from '../auth/store-access.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { StoresService } from './stores.service';

@Controller('stores')
@UseGuards(SessionGuard, RolesGuard, StoreAccessGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @RequireRoles('admin', 'operator')
  listVisibleStores(@CurrentUser() user: AuthenticatedUser) {
    return this.storesService.listVisibleStores(user);
  }

  @Get('admin-check')
  @RequireRoles('admin')
  getAdminCheck(@CurrentUser() user: AuthenticatedUser) {
    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get(':storeId/access-check')
  @RequireRoles('admin', 'operator')
  @RequireStoreAccess('storeId', 'params')
  getStoreAccessCheck(@Param('storeId') storeId: string, @CurrentUser() user: AuthenticatedUser) {
    return {
      ok: true,
      storeId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
