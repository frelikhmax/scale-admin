import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequireRoles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SessionGuard } from '../auth/session.guard';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(SessionGuard, RolesGuard)
@RequireRoles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
}
