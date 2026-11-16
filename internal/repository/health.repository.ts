import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthRepository {
  getSystemMetrics(): { uptimeSeconds: number; timestamp: string } {
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}