import { Injectable } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';

@Injectable()
export class HealthRepository {
  constructor(private readonly db: PostgresService) {}

  async checkDatabase(): Promise<boolean> {
    return this.db.ping();
  }

  getSystemMetrics(): { uptimeSeconds: number; timestamp: string } {
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}