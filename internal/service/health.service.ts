import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { HealthRepository } from '../repository/health.repository';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly healthRepository: HealthRepository,
  ) {}

  async checkHealth() {
    const isDbUp = await this.healthRepository.checkDatabase();
    const metrics = this.healthRepository.getSystemMetrics();

    if (!isDbUp) {
      return {
        ok: false,
        body: {
          status: 'unavailable',
          db: 'down',
          app_name: this.configService.appName,
          version: this.configService.appVersion,
          environment: this.configService.appEnv,
          uptime_seconds: metrics.uptimeSeconds,
          timestamp: metrics.timestamp,
        },
      };
    }

    return {
      ok: true,
      body: {
        status: 'ok',
        db: 'up',
        app_name: this.configService.appName,
        version: this.configService.appVersion,
        environment: this.configService.appEnv,
        uptime_seconds: metrics.uptimeSeconds,
        timestamp: metrics.timestamp,
      },
    };
  }
}