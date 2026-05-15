import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RateLimit } from '../auth/rate-limit.decorator';
import { RateLimitGuard } from '../auth/rate-limit.guard';
import { SkipCsrf } from '../auth/skip-csrf.decorator';
import { CurrentScaleDevice } from './current-scale-device.decorator';
import { ScaleApiAuthGuard, type AuthenticatedScaleDevice } from './scale-api-auth.guard';
import { ScalesService } from './scales.service';

type CheckUpdateBody = {
  currentCatalogVersionId?: unknown;
};

@Controller('scale-api')
@SkipCsrf()
@UseGuards(RateLimitGuard, ScaleApiAuthGuard)
@RateLimit({ bucket: 'scale-api', maxAttempts: 20, windowSeconds: 60 })
export class ScaleApiController {
  constructor(private readonly scalesService: ScalesService) {}

  @Get('auth-check')
  authCheck(@CurrentScaleDevice() device: AuthenticatedScaleDevice) {
    return this.scalesService.getScaleApiAuthCheck(device);
  }

  @Post('check-update')
  checkUpdate(@CurrentScaleDevice() device: AuthenticatedScaleDevice, @Body() body: CheckUpdateBody) {
    const currentCatalogVersionId = typeof body.currentCatalogVersionId === 'string' ? body.currentCatalogVersionId : undefined;
    return this.scalesService.getScaleApiNoUpdateResponse(device, currentCatalogVersionId);
  }
}
