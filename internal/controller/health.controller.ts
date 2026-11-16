import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from '../service/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.healthService.checkHealth();
  }
}