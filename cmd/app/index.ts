import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../internal/app.module';
import { AppConfigService } from '../../internal/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Устанавливаем префикс /api/v1 для всех маршрутов
  app.setGlobalPrefix('api/v1');

  await app.listen(config.httpPort);
  console.log(
    `🚀 [${config.appName}] Server is running in ${config.appEnv} mode on: http://localhost:${config.httpPort}/api/v1/health`,
  );
}

bootstrap();