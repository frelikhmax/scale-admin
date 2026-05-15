import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogValidationService } from './catalog-validation.service';
import { PublishingController } from './publishing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PublishingController],
  providers: [CatalogValidationService],
  exports: [CatalogValidationService],
})
export class PublishingModule {}
