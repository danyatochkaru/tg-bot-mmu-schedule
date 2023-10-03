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
      } else {
        if (
          ('username' in ctx.from && user.username !== ctx.from.username) ||
          ('first_name' in ctx.from &&
            user.first_name !== ctx.from.first_name) ||
          ('last_name' in ctx.from && user.last_name !== ctx.from.last_name)
        ) {
          this.usersService
            .editInfo(ctx.from.id, {
              last_name: ctx.from.last_name,
              first_name: ctx.from.first_name,
              username: ctx.from.username,
            })
            .then((r) => this.logger.log(`user info ${r.uid}: updated`))
            .catch((err) =>
              this.logger.error(
                `user info ${ctx.from.id}: update errored`,
                err,
              ),
            );
        }
      }

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
          : this.scheduleService.prepareTextMessageForDay(data, date),
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
      } else {
        if (
          ('username' in ctx.from && user.username !== ctx.from.username) ||
          ('first_name' in ctx.from &&
            user.first_name !== ctx.from.first_name) ||
          ('last_name' in ctx.from && user.last_name !== ctx.from.last_name)
        ) {
          this.usersService
            .editInfo(ctx.from.id, {
              last_name: ctx.from.last_name,
              first_name: ctx.from.first_name,
              username: ctx.from.username,
            })
            .then((r) => this.logger.log(`user info ${r.uid}: updated`))
            .catch((err) =>
              this.logger.error(
                `user info ${ctx.from.id}: update errored`,
                err,
              ),
            );
        }
      }

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
          ? this.scheduleService.prepareTextMessageForDay(data, date)
          : this.scheduleService.prepareTextMessageForWeek(data, date),
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
    } else {
      if (
        ('username' in ctx.from && user.username !== ctx.from.username) ||
        ('first_name' in ctx.from && user.first_name !== ctx.from.first_name) ||
        ('last_name' in ctx.from && user.last_name !== ctx.from.last_name)
      ) {
        this.usersService
          .editInfo(ctx.from.id, {
            last_name: ctx.from.last_name,
            first_name: ctx.from.first_name,
            username: ctx.from.username,
          })
          .then((r) => this.logger.log(`user info ${r.uid}: updated`))
          .catch((err) =>
            this.logger.error(`user info ${ctx.from.id}: update errored`, err),
          );
      }
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
          )
        : this.scheduleService.prepareTextMessageForWeek(
            (data as LessonDto[][]).flat(),
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
