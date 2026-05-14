import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginBody, @Req() request: any, @Res({ passthrough: true }) response: any) {
    const result = await this.authService.login(String(body.email ?? ''), String(body.password ?? ''), {
      ipAddress: this.getRequestIp(request),
      userAgent: this.getHeader(request, 'user-agent'),
    });

    response.cookie(result.cookieName, result.sessionToken, result.cookieOptions);

    return {
      user: result.user,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request: any, @Res({ passthrough: true }) response: any) {
    const cookieName = this.authService.getCookieName();
    const sessionToken = this.getCookie(request, cookieName);
    const revoked = await this.authService.logout(sessionToken);

    response.clearCookie(cookieName, this.authService.getClearCookieOptions());

    return { revoked };
  }

  @Get('session')
  async getSession(@Req() request: any) {
    const sessionToken = this.getCookie(request, this.authService.getCookieName());
    return this.authService.getCurrentSession(sessionToken);
  }

  private getRequestIp(request: any): string | undefined {
    const forwardedFor = this.getHeader(request, 'x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim();
    }

    return request.ip ?? request.socket?.remoteAddress;
  }

  private getHeader(request: any, name: string): string | undefined {
    const header = request.headers?.[name];
    if (Array.isArray(header)) {
      return header.join(', ');
    }

    return typeof header === 'string' ? header : undefined;
  }

  private getCookie(request: any, cookieName: string): string | undefined {
    const cookieHeader = this.getHeader(request, 'cookie');
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [rawName, ...rawValueParts] = cookie.trim().split('=');
      if (rawName === cookieName) {
        const rawValue = rawValueParts.join('=');
        return rawValue ? decodeURIComponent(rawValue) : undefined;
      }
    }

    return undefined;
  }
}
