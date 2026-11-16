import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppConfigService {
  get appName(): string {
    return process.env.APP_NAME || 'Podcast Hosting & Streaming API';
  }

  get appEnv(): string {
    return process.env.APP_ENV || 'development';
  }

  get appVersion(): string {
    return process.env.APP_VERSION || '1.0.0';
  }

  get httpPort(): number {
    return parseInt(process.env.HTTP_PORT || '3000', 10);
  }
}