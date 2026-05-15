import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RequireRoles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { RequireStoreAccess } from '../auth/store-access.decorator';
import { StoreAccessGuard } from '../auth/store-access.guard';
import { CatalogPackageService } from './catalog-package.service';
import { CatalogValidationService } from './catalog-validation.service';

@Controller('stores/:storeId/publishing')
@UseGuards(SessionGuard, RolesGuard, StoreAccessGuard)
@RequireRoles('admin', 'operator')
@RequireStoreAccess('storeId', 'params')
export class PublishingController {
  constructor(
    private readonly catalogValidationService: CatalogValidationService,
    private readonly catalogPackageService: CatalogPackageService,
  ) {}

  @Post('catalog-validation')
  validateActiveCatalog(@Param('storeId') storeId: string) {
    return this.catalogValidationService.validateActiveCatalog(storeId);
  }

  @Get('catalog-validation')
  getActiveCatalogValidation(@Param('storeId') storeId: string) {
    return this.catalogValidationService.validateActiveCatalog(storeId);
  }

  @Post('catalog-package')
  generateActiveCatalogPackage(@Param('storeId') storeId: string) {
    return this.catalogPackageService.generateActiveCatalogPackage(storeId);
  }

  @Get('catalog-package')
  getActiveCatalogPackage(@Param('storeId') storeId: string) {
    return this.catalogPackageService.generateActiveCatalogPackage(storeId);
  }
}
