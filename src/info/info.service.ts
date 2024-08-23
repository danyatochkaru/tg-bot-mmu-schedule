import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InfoUsersObject } from './info.interface';
import { startOfDay } from 'date-fns/startOfDay';

@Injectable()
export class InfoService {
  constructor(private readonly usersService: UsersService) {}

  async getUsersCount(date?: Date): Promise<InfoUsersObject> {
    const result: InfoUsersObject = {
      total_count: 0,
      details: [],
    };

    if (date) {
      const [groups, count] =
        await this.usersService.getGroupsWithCountNewUsers([date]);

      result.total_count = count;
      result.details = groups.reduce(
        (acc, group) => {
          if (
            acc.some(
              (i) =>
                i.group_id === group.group_id && i.date === group.created_at,
            )
          ) {
            const index = acc.findIndex(
              (i) =>
                i.group_id === group.group_id && i.date === group.created_at,
            );
            acc[index].count += 1;
          } else {
            acc.push({
              group_id: group.group_id,
              count: 1,
              date: group.created_at,
              scale: 'day',
            });
          }
          return acc;
        },
        [] as InfoUsersObject['details'],
      );
    } else {
      result.total_count = await this.usersService.getCount();
    }

    if (date) result.date = startOfDay(date);

    return result;
  }
}
