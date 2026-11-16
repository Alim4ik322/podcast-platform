import { Module } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { HealthController } from './controller/health.controller';
import { HealthService } from './service/health.service';
import { HealthRepository } from './repository/health.repository';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [AppConfigService, HealthService, HealthRepository],
})
export class AppModule {}