import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ScheduleService } from './schedule.service';
import { dayController, weekController } from './schedule.buttons';
import { editMessage } from '../utils/eidtMessage';
import { UsersService } from '../users/users.service';

@Update()
export class ScheduleUpdate {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly usersService: UsersService,
  ) {}

  @Action(/day-/i)
  async getForDay(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, 'Получаю данные...');

      const user = await this.usersService.getInfo(ctx.from.id);

      if (!user) {
        await editMessage(ctx, 'Группа не выбрана. Пройти регистрацию: /start');
        return;
      }

      const date = new Date(ctx.callbackQuery.data.replace('day-', ''));
      const data = await this.scheduleService.fetchSchedule(
        user.group_id,
        date,
        'day',
      );

      await editMessage(
        ctx,
        'error' in data
          ? 'Сайт не ответил на твой запрос :(\n\nТы можешь попробовать ещё раз'
          : this.scheduleService.prepareTextMessageForDay(data, date),
        {
          reply_markup: dayController(date, 'error' in data).reply_markup,
          parse_mode: 'HTML',
        },
      );
    }
  }

  @Action(/week-/i)
  async getForWeek(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, 'Получаю данные...');

      const user = await this.usersService.getInfo(ctx.from.id);

      if (!user) {
        await editMessage(ctx, 'Группа не выбрана. Пройти регистрацию: /start');
        return;
      }

      const date = new Date(ctx.callbackQuery.data.replace('week-', ''));
      const data = await this.scheduleService.fetchSchedule(
        user.group_id,
        date,
        'week',
      );

      await editMessage(
        ctx,
        'error' in data
          ? 'Сайт не ответил на твой запрос :(\n\nТы можешь попробовать ещё раз'
          : this.scheduleService.prepareTextMessageForWeek(data, date),
        {
          reply_markup: weekController(date, 'error' in data).reply_markup,
          parse_mode: 'HTML',
        },
      );
    }
  }
}
