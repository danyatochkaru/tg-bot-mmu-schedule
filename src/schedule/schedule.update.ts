import { Action, Ctx, Hears, Message, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ScheduleService } from './schedule.service';
import {
  dayController,
  emptyController,
  weekController,
} from './schedule.buttons';
import { editMessage } from '../utils/editMessage';
import { UsersService } from '../users/users.service';
import { getDayOfWeek } from '../utils/getDayOfWeek';
import * as chrono from 'chrono-node';
import { LessonDto } from './dto/Lesson.dto';
import { MESSAGES } from '../app.constants';

@Update()
export class ScheduleUpdate {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly usersService: UsersService,
  ) {}

  @Action(/day-/i)
  async getForDay(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, MESSAGES['ru'].FETCHING);

      const user = await this.usersService.getInfo(ctx.from.id);

      if (!user) {
        await editMessage(ctx, MESSAGES['ru'].GROUP_NOT_SELECTED);
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
          ? MESSAGES['ru'].NO_ANSWER_RETRY
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
      await editMessage(ctx, MESSAGES['ru'].FETCHING);

      const user = await this.usersService.getInfo(ctx.from.id);

      if (!user) {
        await editMessage(ctx, MESSAGES['ru'].GROUP_NOT_SELECTED);
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
          ? MESSAGES['ru'].NO_ANSWER_RETRY
          : user.detail_week
          ? this.scheduleService.prepareTextMessageForDay(data, date)
          : this.scheduleService.prepareTextMessageForWeek(data, date),
        {
          reply_markup: weekController(date, {
            hasError: 'error' in data,
            days:
              'error' in data
                ? []
                : data
                    .map((i) => i.date)
                    .filter((x, i, a) => a.indexOf(x) === i)
                    .map((i) => ({
                      date: new Date(i),
                      name: getDayOfWeek(new Date(i), true),
                    })),
          }).reply_markup,
          parse_mode: 'HTML',
        },
      );
    }
  }

  @Hears(/расписание/gi)
  async getFromText(@Ctx() ctx: Context, @Message() msg: { text: string }) {
    const message = await ctx.reply(MESSAGES['ru'].PROCESSING);
    const user = await this.usersService.getInfo(ctx.from.id);

    if (!user) {
      await editMessage(ctx, MESSAGES['ru'].GROUP_NOT_SELECTED, {}, message);
      return;
    }
    let dates = chrono.ru.parse(msg.text, new Date(), {
      timezones: { XYZ: 3 },
    });

    if (msg.text.replace('расписание', '').trim() === '') {
      dates = chrono.ru.parse('сегодня', new Date(), {
        timezones: { XYZ: 3 },
      });
    }

    if (dates.length === 0) {
      await editMessage(
        ctx,
        MESSAGES['ru'].UNKNOWN_DATES_SCHEDULE,
        {
          reply_markup: emptyController().reply_markup,
          parse_mode: 'Markdown',
        },
        message,
      );
      return;
    }

    const data: LessonDto[][] = await this.scheduleService.fetchScheduleByDates(
      user.group_id,

      dates.map((date) => ({
        start: date.start?.date(),
        end: date.end?.date(),
      })),
    );

    const anyWithError = data.flat().find((value) => 'error' in value);

    if (anyWithError) {
      console.log(anyWithError);
      await editMessage(ctx, MESSAGES['ru'].NO_ANSWER_RETRY, {}, message);
      return;
    }

    await editMessage(
      ctx,
      user.detail_week
        ? this.scheduleService.prepareTextMessageForDay(
            data.flat(),
            dates.length && dates[0].start?.date(),
          )
        : this.scheduleService.prepareTextMessageForWeek(
            data.flat(),
            dates.length && dates[0].start?.date(),
          ),
      {
        reply_markup: emptyController().reply_markup,
        parse_mode: 'HTML',
      },
      message,
    );
  }
}
