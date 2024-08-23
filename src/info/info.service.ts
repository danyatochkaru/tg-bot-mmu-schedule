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

      const [users, count] = await this.usersService.getGroupsWithCountNewUsers(
        [dateFns[scale][0](date), dateFns[scale][1](date)],
      );

      result.total_count = count;
      result.details = users.reduce(
        (acc, user) => {
          const findEqDatesFn = (i) =>
            startOfDay(i.date).getTime() ===
            startOfDay(user.created_at).getTime();

          if (acc.some(findEqDatesFn)) {
            const index = acc.findIndex(findEqDatesFn);

            const findEqGroupsFn = (i) => i.group_id === user.group_id;
            if (acc[index].groups.some(findEqGroupsFn)) {
              acc[index].groups[
                acc[index].groups.findIndex(findEqGroupsFn)
              ].count += 1;

              acc[index].groups[
                acc[index].groups.findIndex(findEqGroupsFn)
              ].inactive_count += user.is_inactive ? 1 : 0;
            } else {
              acc[index].groups.push({
                group_id: user.group_id,
                group_name: user.group_name,
                inactive_count: user.is_inactive ? 1 : 0,
                count: 1,
              });
            }
          } else {
            acc.push({
              groups: [
                {
                  group_id: user.group_id,
                  group_name: user.group_name,
                  inactive_count: user.is_inactive ? 1 : 0,
                  count: 1,
                },
              ],
              date: startOfDay(user.created_at),
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
