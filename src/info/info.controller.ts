import { Controller, Get, Query } from '@nestjs/common';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('users/count')
  async getUsersCount(
    @Query('date') date?: Date,
    @Query('scale') scale?: 'day' | 'week' | 'month',
  ) {
    return this.infoService.getUsersCount(
      date ? new Date(date) : undefined,
      scale,
    );
  }
}
