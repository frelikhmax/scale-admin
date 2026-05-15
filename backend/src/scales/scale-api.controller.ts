import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { getHeader } from '../auth/cookie.util';
import { RateLimit } from '../auth/rate-limit.decorator';
import { RateLimitGuard } from '../auth/rate-limit.guard';
import { SkipCsrf } from '../auth/skip-csrf.decorator';
import { CurrentScaleDevice } from './current-scale-device.decorator';
import { ScaleApiAuthGuard, type AuthenticatedScaleDevice } from './scale-api-auth.guard';
import { ScalesService } from './scales.service';

type CheckUpdateBody = {
  currentCatalogVersionId?: unknown;
};

type AckBody = {
  versionId?: unknown;
  status?: unknown;
  errorMessage?: unknown;
};

@Controller()
@SkipCsrf()
@UseGuards(RateLimitGuard, ScaleApiAuthGuard)
@RateLimit({ bucket: 'scale-api', maxAttempts: 20, windowSeconds: 60 })
export class ScaleApiController {
  constructor(private readonly scalesService: ScalesService) {}

  @Get('scale-api/auth-check')
  authCheck(@CurrentScaleDevice() device: AuthenticatedScaleDevice) {
    return this.scalesService.getScaleApiAuthCheck(device);
  }

  @Post('scales/check-update')
  checkUpdate(@CurrentScaleDevice() device: AuthenticatedScaleDevice, @Body() body: CheckUpdateBody, @Req() request: any) {
    const currentCatalogVersionId = typeof body.currentCatalogVersionId === 'string' ? body.currentCatalogVersionId : undefined;
    return this.scalesService.checkScaleUpdate(device, currentCatalogVersionId, this.getRequestContext(request));
  }

  @Post('scale-api/check-update')
  checkUpdateLegacy(@CurrentScaleDevice() device: AuthenticatedScaleDevice, @Body() body: CheckUpdateBody, @Req() request: any) {
    return this.checkUpdate(device, body, request);
  }

  @Post('scales/ack')
  acknowledgeCatalogVersion(@CurrentScaleDevice() device: AuthenticatedScaleDevice, @Body() body: AckBody, @Req() request: any) {
    return this.scalesService.acknowledgeScaleCatalogVersion(
      device,
      {
        versionId: typeof body.versionId === 'string' ? body.versionId : undefined,
        status: typeof body.status === 'string' ? body.status : undefined,
        errorMessage: typeof body.errorMessage === 'string' ? body.errorMessage : undefined,
      },
      this.getRequestContext(request),
    );
  }

  private getRequestContext(request: any) {
    const forwardedFor = getHeader(request, 'x-forwarded-for');
    return {
      ipAddress: forwardedFor?.split(',')[0]?.trim() || request.ip || request.socket?.remoteAddress,
      userAgent: getHeader(request, 'user-agent'),
    };
  }
}
