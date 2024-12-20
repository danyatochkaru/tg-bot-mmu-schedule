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
import { Logger } from '@nestjs/common';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class ScheduleUpdate {
  private logger = new Logger(ScheduleUpdate.name);

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

      await this.usersService.checkUserDataUpdated(ctx.from);

      const payload = ctx.callbackQuery.data.replace('day-', '');
      const date = new Date(payload === 'current' ? Date.now() : payload);
      const data = await this.scheduleService.fetchSchedule(
        user.group_id,
        date,
        'day',
      );

      await editMessage(
        ctx,
        data instanceof Error
          ? MESSAGES['ru'].NO_ANSWER_RETRY
          : this.scheduleService.prepareTextMessageForDay(data, date, {
              hide_buildings: user.hide_buildings,
            }),
        {
          reply_markup: dayController(date, data instanceof Error).reply_markup,
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
      await this.usersService.checkUserDataUpdated(ctx.from);

      const payload = ctx.callbackQuery.data.replace('week-', '');
      const date = new Date(payload === 'current' ? Date.now() : payload);
      const data = await this.scheduleService.fetchSchedule(
        user.group_id,
        date,
        'week',
      );

      await editMessage(
        ctx,
        data instanceof Error
          ? MESSAGES['ru'].NO_ANSWER_RETRY
          : user.detail_week
            ? this.scheduleService.prepareTextMessageForDay(data, date, {
                hide_buildings: user.hide_buildings,
              })
            : this.scheduleService.prepareTextMessageForWeek(data, date, {
                hide_buildings: user.hide_buildings,
              }),
        {
          reply_markup: weekController(date, {
            hasError: data instanceof Error,
            days:
              data instanceof Error
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
    await this.usersService.checkUserDataUpdated(ctx.from);

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

    const data: (LessonDto[] | Error)[] =
      await this.scheduleService.fetchScheduleByDates(
        user.group_id,

        dates.map((date) => ({
          start: date.start?.date(),
          end: date.end?.date(),
        })),
      );

    const anyWithError = data.flat().find((value) => value instanceof Error);

    if (anyWithError instanceof Error) {
      this.logger.debug(anyWithError);
      await editMessage(ctx, MESSAGES['ru'].NO_ANSWER_RETRY, {}, message);
      return;
    }

    await editMessage(
      ctx,
      user.detail_week
        ? this.scheduleService.prepareTextMessageForDay(
            (data as LessonDto[][]).flat(),
            dates.length && dates[0].start?.date(),
            { hide_buildings: user.hide_buildings },
          )
        : this.scheduleService.prepareTextMessageForWeek(
            (data as LessonDto[][]).flat(),
            dates.length && dates[0].start?.date(),
            { hide_buildings: user.hide_buildings },
          ),
      {
        reply_markup: emptyController().reply_markup,
        parse_mode: 'HTML',
      },
      message,
    );
  }
}
