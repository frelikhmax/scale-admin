import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogValidationService } from './catalog-validation.service';
import { PublishingController } from './publishing.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PublishingController],
  providers: [CatalogValidationService],
  exports: [CatalogValidationService],
})
export class PublishingModule {}
