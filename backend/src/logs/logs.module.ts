import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuditLogService } from './audit-log.service';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [LogsController],
  providers: [AuditLogService, LogsService],
  exports: [AuditLogService],
})
export class LogsModule {}
