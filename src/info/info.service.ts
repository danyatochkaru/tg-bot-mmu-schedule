import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InfoUsersObject } from './info.interface';
import { Between } from 'typeorm';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';

@Injectable()
export class InfoService {
  constructor(private readonly usersService: UsersService) {}

  async getUsersCount(date?: Date): Promise<InfoUsersObject> {
    const result: InfoUsersObject = {
      total_count: 0,
      details: [],
    };

    result.total_count = await this.usersService.getCount(
      Object.assign(
        {},
        date
          ? {
              created_at: Between(startOfDay(date), endOfDay(date)),
            }
          : undefined,
      ),
    );

    if (date) result.date = startOfDay(date);

    return result;
  }
}
