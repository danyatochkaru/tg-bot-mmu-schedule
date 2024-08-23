import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InfoUsersObject } from './info.interface';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { startOfWeek } from 'date-fns/startOfWeek';
import { endOfWeek } from 'date-fns/endOfWeek';
import { endOfMonth } from 'date-fns/endOfMonth';
import { startOfMonth } from 'date-fns/startOfMonth';

@Injectable()
export class InfoService {
  constructor(private readonly usersService: UsersService) {}

  async getUsersCount(
    date?: Date,
    scale: 'day' | 'week' | 'month' = 'day',
  ): Promise<InfoUsersObject> {
    const result: InfoUsersObject = {
      total_count: 0,
      details: [],
    };

    if (date) {
      const dateFns: Record<'day' | 'week' | 'month', [any, any]> = {
        day: [startOfDay, endOfDay],
        week: [startOfWeek, endOfWeek],
        month: [startOfMonth, endOfMonth],
      };

      const [groups, count] =
        await this.usersService.getGroupsWithCountNewUsers([
          dateFns[scale][0](date),
          dateFns[scale][1](date),
        ]);

      result.total_count = count;
      result.details = groups.reduce(
        (acc, group) => {
          if (
            acc.some((i) => startOfDay(i.date) === startOfDay(group.created_at))
          ) {
            const index = acc.findIndex(
              (i) => startOfDay(i.date) === startOfDay(group.created_at),
            );
            acc[index].count += 1;
            if (acc[index].groups.some((i) => i.group_id === group.group_id)) {
              acc[index].groups[
                acc[index].groups.findIndex(
                  (i) => i.group_id === group.group_id,
                )
              ].count += 1;
            }
          } else {
            acc.push({
              groups: [
                {
                  group_id: group.group_id,
                  group_name: group.group_name,
                  count: 1,
                },
              ],
              count: 1,
              date: group.created_at,
              scale,
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
