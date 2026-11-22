import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CreatePodcastDto,
  toPodcastResponseDto,
  UpdatePodcastDto,
} from '../dto/podcast.dto';
import { PodcastService } from '../service/podcast.service';

@Controller('api/v1/podcasts')
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @Post()
  async create(@Body() dto: CreatePodcastDto, @Res() res: Response) {
    const created = await this.podcastService.create(dto);
    const body = toPodcastResponseDto(created);
    return res
      .status(HttpStatus.CREATED)
      .location(`/api/v1/podcasts/${body.id}`)
      .json(body);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const podcast = await this.podcastService.getById(id);
    return toPodcastResponseDto(podcast);
  }

  @Get()
  async list(
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    const items = await this.podcastService.list(Number(limit), Number(offset));
    return items.map(toPodcastResponseDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePodcastDto) {
    const updated = await this.podcastService.update(id, dto);
    return toPodcastResponseDto(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.podcastService.delete(id);
  }
}