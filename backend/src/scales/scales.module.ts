import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScalesController } from './scales.controller';
import { ScalesService } from './scales.service';

@Module({
  imports: [AuthModule],
  controllers: [ScalesController],
  providers: [ScalesService],
})
export class ScalesModule {}
