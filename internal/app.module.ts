import { Module } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { PostgresService } from './database/postgres.service';
import { HealthController } from './controller/health.controller';
import { HealthService } from './service/health.service';
import { HealthRepository } from './repository/health.repository';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [
    AppConfigService,
    PostgresService,
    HealthService,
    HealthRepository,
  ],
})
export class AppModule {}