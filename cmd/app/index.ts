import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../internal/app.module';
import { AppConfigService } from '../../internal/config/config.service';
import { DomainExceptionFilter } from '../../internal/controller/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalFilters(new DomainExceptionFilter());

  const config = app.get(AppConfigService);

  await app.listen(config.httpPort);
  console.log(
    `[HTTP] Server starting on port ${config.httpPort} (${config.appEnv} mode)...`,
  );
}

bootstrap();