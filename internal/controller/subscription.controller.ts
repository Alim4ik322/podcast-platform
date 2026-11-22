import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CreateSubscriptionDto,
  toSubscriptionResponseDto,
} from '../dto/subscription.dto';
import { SubscriptionService } from '../service/subscription.service';

@Controller('api/v1/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async create(@Body() dto: CreateSubscriptionDto, @Res() res: Response) {
    const created = await this.subscriptionService.create(dto);
    const body = toSubscriptionResponseDto(created);
    return res
      .status(HttpStatus.CREATED)
      .location(`/api/v1/subscriptions/${body.id}`)
      .json(body);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const sub = await this.subscriptionService.getById(id);
    return toSubscriptionResponseDto(sub);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    const cancelled = await this.subscriptionService.cancel(id);
    return toSubscriptionResponseDto(cancelled);
  }
}