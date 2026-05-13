import { registerAs } from '@nestjs/config';

export interface AppConfiguration {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  frontendOrigin: string;
}

export default registerAs(
  'app',
  (): AppConfiguration => ({
    nodeEnv: process.env.NODE_ENV as string,
    port: Number(process.env.PORT),
    databaseUrl: process.env.DATABASE_URL as string,
    frontendOrigin: process.env.FRONTEND_ORIGIN as string,
  }),
);
