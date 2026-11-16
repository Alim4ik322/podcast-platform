import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { HealthRepository } from '../repository/health.repository';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly healthRepository: HealthRepository,
  ) {}

  checkHealth() {
    const metrics = this.healthRepository.getSystemMetrics();

    return {
      status: 'pass',
      app_name: this.configService.appName,
      version: this.configService.appVersion,
      environment: this.configService.appEnv,
      uptime_seconds: metrics.uptimeSeconds,
      timestamp: metrics.timestamp,
    };
  }
}