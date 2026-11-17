import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppConfigService {
  readonly appName: string;
  readonly appEnv: string;
  readonly appVersion: string;
  readonly httpPort: number;

  readonly dbHost: string;
  readonly dbPort: number;
  readonly dbUser: string;
  readonly dbPassword: string;
  readonly dbName: string;
  readonly dbMaxConns: number;

  constructor() {
    this.appName = process.env.APP_NAME || 'Podcast Hosting & Streaming API';
    this.appEnv = process.env.APP_ENV || 'development';
    this.appVersion = process.env.APP_VERSION || '1.0.0';
    this.httpPort = parseInt(process.env.HTTP_PORT || '3000', 10);

    this.dbHost = process.env.DB_HOST || '';
    this.dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    this.dbUser = process.env.DB_USER || '';
    this.dbPassword = process.env.DB_PASSWORD || '';
    this.dbName = process.env.DB_NAME || '';

    const required: Record<string, string> = {
      DB_HOST: this.dbHost,
      DB_USER: this.dbUser,
      DB_PASSWORD: this.dbPassword,
      DB_NAME: this.dbName,
    };

    for (const [key, value] of Object.entries(required)) {
      if (!value) {
        console.error(`[CONFIG] Error: required environment variable ${key} is not set`);
        process.exit(1);
      }
    }

    const maxConns = parseInt(process.env.DB_MAX_CONNS || '10', 10);
    if (isNaN(maxConns) || maxConns < 1) {
      console.error('[CONFIG] Error: DB_MAX_CONNS must be a positive integer');
      process.exit(1);
    }
    this.dbMaxConns = maxConns;

    console.log('[CONFIG] Environment variables loaded successfully');
  }

  get dsn(): string {
    const user = encodeURIComponent(this.dbUser);
    const pass = encodeURIComponent(this.dbPassword);
    return `postgres://${user}:${pass}@${this.dbHost}:${this.dbPort}/${this.dbName}?sslmode=disable`;
  }
}