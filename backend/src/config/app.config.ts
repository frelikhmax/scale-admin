import { registerAs } from '@nestjs/config';

export interface AppConfiguration {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  frontendOrigin: string;
  sessionCookieName: string;
  sessionIdleTimeoutMinutes: number;
  sessionAbsoluteTimeoutDays: number;
}

export default registerAs(
  'app',
  (): AppConfiguration => ({
    nodeEnv: process.env.NODE_ENV as string,
    port: Number(process.env.PORT),
    databaseUrl: process.env.DATABASE_URL as string,
    frontendOrigin: process.env.FRONTEND_ORIGIN as string,
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'scale_admin_session',
    sessionIdleTimeoutMinutes: Number(process.env.SESSION_IDLE_TIMEOUT_MINUTES || 30),
    sessionAbsoluteTimeoutDays: Number(process.env.SESSION_ABSOLUTE_TIMEOUT_DAYS || 14),
  }),
);
