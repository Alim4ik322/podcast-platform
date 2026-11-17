import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly maxAttempts = 10;

  constructor(private readonly config: AppConfigService) {
    this.pool = new Pool({
      connectionString: this.config.dsn,
      max: this.config.dbMaxConns,
      idleTimeoutMillis: 5 * 60 * 1000,
      connectionTimeoutMillis: 3000,
    });
  }

  async onModuleInit(): Promise<void> {
    let lastErr: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log(
          `[DATABASE] Successfully connected to PostgreSQL at ${this.config.dbHost}:${this.config.dbPort} (max_conns=${this.config.dbMaxConns})`,
        );
        return;
      } catch (err) {
        lastErr = err;
        const waitSec = attempt;
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `[DATABASE] attempt ${attempt}/${this.maxAttempts} failed: ${message}; retry in ${waitSec}s`,
        );
        await new Promise((res) => setTimeout(res, waitSec * 1000));
      }
    }

    console.error(
      `[DATABASE] Database is unavailable after ${this.maxAttempts} attempts:`,
      lastErr,
    );
    process.exit(1);
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}