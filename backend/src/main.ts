import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { AppConfiguration } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfiguration>('app');

  app.enableCors({
    origin: appConfig.frontendOrigin,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(appConfig.port, '0.0.0.0');
}

bootstrap();
