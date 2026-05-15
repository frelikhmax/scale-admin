import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdvertisingController } from './advertising.controller';
import { AdvertisingService } from './advertising.service';

@Module({
  imports: [AuthModule],
  controllers: [AdvertisingController],
  providers: [AdvertisingService],
})
export class AdvertisingModule {}
