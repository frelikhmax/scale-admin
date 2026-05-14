import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { getCookie, getHeader } from './cookie.util';
import { CsrfService } from './csrf.service';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ method?: string; headers?: Record<string, string | string[] | undefined> }>();
    const method = request.method?.toUpperCase() ?? 'GET';
    if (safeMethods.has(method)) {
      return true;
    }

    const cookieToken = getCookie(request, this.csrfService.getCookieName());
    const headerToken = getHeader(request, this.csrfService.getHeaderName());
    if (!this.csrfService.tokensMatch(cookieToken, headerToken)) {
      throw new ForbiddenException({
        message: 'CSRF token required or invalid',
        error: 'Forbidden',
        code: 'CSRF_TOKEN_INVALID',
        statusCode: 403,
      });
    }

    return true;
  }
}
