import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StoresController } from './stores.controller';

@Module({
  imports: [AuthModule],
  controllers: [StoresController],
})
export class StoresModule {}
