import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InfoUsersObject } from './info.interface';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { addDays } from 'date-fns/addDays';

@Injectable()
export class InfoService {
  constructor(private readonly usersService: UsersService) {}

  async getUsersCount(
    date?: Date,
    days: number = 1,
    dir: 'next' | 'prev' = 'prev',
  ): Promise<InfoUsersObject> {
    const result: InfoUsersObject = {
      total_count: 0,
      details: [],
    };

    console.log(
      date,
      addDays(date, -days),
      addDays(date, days),
      date && startOfDay(dir === 'prev' ? addDays(date, -days) : date),
      date && endOfDay(dir === 'next' ? addDays(date, days) : date),
    );

    if (date) {
      const [users, count] = await this.usersService.getGroupsWithCountNewUsers(
        [
          startOfDay(dir === 'prev' ? addDays(date, -days) : date),
          endOfDay(dir === 'next' ? addDays(date, days) : date),
        ],
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
            });
          }
          return acc;
        },
        [] as InfoUsersObject['details'],
      );
    } else {
      result.total_count = await this.usersService.getCount();
    }

    return result;
  }
}
