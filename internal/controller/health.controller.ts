import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from '../service/health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get(['health', 'api/v1/health'])
  async getHealth(@Res() res: Response) {
    const result = await this.healthService.checkHealth();
    const statusCode = result.ok
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(result.body);
  }
}