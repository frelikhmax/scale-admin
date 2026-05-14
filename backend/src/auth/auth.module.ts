import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { SessionGuard } from './session.guard';
import { StoreAccessGuard } from './store-access.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionGuard, RolesGuard, StoreAccessGuard],
  exports: [AuthService, SessionGuard, RolesGuard, StoreAccessGuard],
})
export class AuthModule {}
