import { Controller, Get, Query } from '@nestjs/common';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('users/count')
  async getUsersCount(
    @Query('date') date?: Date,
    @Query('days') days?: number,
    @Query('dir') dir?: 'next' | 'prev',
  ) {
    const payload = {
      date,
      days,
      dir,
    };

    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );

    return {
      payload,
      data: await this.infoService
        .getUsersCount(date ? new Date(date) : undefined, days || 1, dir)
        .catch((err) => err),
    };
  }
}
