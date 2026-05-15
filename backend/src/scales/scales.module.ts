import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScaleApiController } from './scale-api.controller';
import { ScaleApiAuthGuard } from './scale-api-auth.guard';
import { ScalesController } from './scales.controller';
import { ScalesService } from './scales.service';

@Module({
  imports: [AuthModule],
  controllers: [ScalesController, ScaleApiController],
  providers: [ScalesService, ScaleApiAuthGuard],
})
export class ScalesModule {}
