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
    return {
      payload: Object.assign(
        date && {
          date,
        },
        days && {
          days,
        },
        dir && {
          dir,
        },
      ),
      data: await this.infoService.getUsersCount(
        date ? new Date(date) : undefined,
        days,
        dir,
      ),
    };
  }
}
