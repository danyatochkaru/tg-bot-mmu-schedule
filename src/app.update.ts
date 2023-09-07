import { AppService } from './app.service';
import {
  Action,
  Command,
  Ctx,
  InjectBot,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { endOfWeek, isValid, startOfWeek } from 'date-fns';
import { day, menu, week } from './app.buttoms';
import * as chrono from 'chrono-node';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  @Action('menu')
  async startCommand(@Ctx() ctx: Context) {
    if (ctx?.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx.telegram
        .editMessageText(
          ctx.chat.id,
          ctx.callbackQuery.message.message_id,
          undefined,
          'Меню',
          {
            parse_mode: 'HTML',
            reply_markup: menu().reply_markup,
          },
        )
        .catch((err) => {
          console.log(err);
        });
    } else {
      await ctx.reply('Меню', menu());
    }
  }

  @Command(/today|tomorrow|bot/i)
  @Action(/day-/gi)
  async getDay(@Ctx() ctx: Context & { command?: string; payload?: string }) {
    let answerText: string;
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        undefined,
        'Получаю данные...',
      );
      const date = ctx.callbackQuery.data.replace('day-', '');
      const data = await this.appService.getScheduleFromSite({
        start: new Date(date),
        finish: new Date(date),
      });
      const list = this.appService.formatData(data);
      if (Array.isArray(list)) {
        if (list.length) {
          answerText = this.appService.formatSchedule(list);
        } else {
          answerText = this.appService.wrapInfo(
            `В выбранный вами период пары не найдены`,
            new Date(date),
          );
        }
      } else {
        answerText = 'Произошла ошибка';
      }
      await ctx.telegram
        .editMessageText(
          ctx.chat.id,
          ctx.callbackQuery.message.message_id,
          undefined,
          answerText,
          {
            parse_mode: 'HTML',
            reply_markup: day(
              new Date(ctx.callbackQuery.data.replace('day-', '')),
            ).reply_markup,
          },
        )
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (ctx.command === 'bot') {
        if (!ctx.payload) {
          await ctx.reply('Меню', menu());
        } else {
          if (isValid(chrono.ru.parseDate(ctx.payload, new Date()))) {
            const message = await ctx.reply('Получаю данные...');
            const date = chrono.ru.parseDate(ctx.payload, new Date());

            const data = await this.appService.getScheduleFromSite({
              start: date,
              finish: date,
            });
            const list = this.appService.formatData(data);

            if (Array.isArray(list)) {
              if (list.length) {
                answerText = this.appService.formatSchedule(list);
              } else {
                answerText = this.appService.wrapInfo(
                  `В выбранный вами день пары не найдены`,
                  date,
                );
              }
            } else {
              answerText = list;
            }
            await ctx.telegram.editMessageText(
              ctx.chat.id,
              message.message_id,
              undefined,
              answerText,
              {
                parse_mode: 'HTML',
                reply_markup: day(new Date()).reply_markup,
              },
            );
          }
        }
      } else {
        const message = await ctx.reply('Получаю данные...');
        let date = new Date();
        if (isValid(chrono.parseDate(ctx.command, new Date()))) {
          date = chrono.parseDate(ctx.command, new Date());
        }

        const data = await this.appService.getScheduleFromSite({
          start: date,
          finish: date,
        });
        const list = this.appService.formatData(data);

        if (Array.isArray(list)) {
          if (list.length) {
            answerText = this.appService.formatSchedule(list);
          } else {
            answerText = this.appService.wrapInfo(
              `В выбранный вами день пары не найдены`,
            );
          }
        } else {
          answerText = list;
        }
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          message.message_id,
          undefined,
          answerText,
          { parse_mode: 'HTML', reply_markup: day(new Date()).reply_markup },
        );
      }
    }
  }

  @Command(/week/gi)
  @Action(/week-/gi)
  async getWeek(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        undefined,
        'Получаю данные...',
      );
      const data = await this.appService.getScheduleFromSite({
        start: startOfWeek(
          new Date(ctx.callbackQuery.data.replace('week-', '')),
        ),
        finish: endOfWeek(
          new Date(ctx.callbackQuery.data.replace('week-', '')),
        ),
      });
      const list = this.appService.formatData(data);
      let answerText = this.appService.wrapInfo(
        `В выбранный вами период пары не найдены`,
      );

      if (Array.isArray(list)) {
        if (list.length) {
          answerText = this.appService.formatSchedule(list);
        }
      } else {
        answerText = 'Произошла ошибка';
      }
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        undefined,
        answerText,
        {
          parse_mode: 'HTML',
          reply_markup: week(
            new Date(ctx.callbackQuery.data.replace('week-', '')),
          ).reply_markup,
        },
      );
    } else {
      const message = await ctx.reply('Получаю данные...');
      const date = new Date();
      const data = await this.appService.getScheduleFromSite({
        start: startOfWeek(date),
        finish: endOfWeek(date),
      });
      const list = this.appService.formatData(data);
      let answerText = this.appService.wrapInfo(
        `В выбранный вами период пары не найдены`,
      );

      if (Array.isArray(list)) {
        if (list.length) {
          answerText = this.appService.formatSchedule(list);
        }
      } else {
        answerText = 'Произошла ошибка';
      }
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        answerText,
        {
          parse_mode: 'HTML',
          reply_markup: week(date).reply_markup,
        },
      );
    }
  }

  @Command('info')
  async info(@Ctx() ctx: Context) {
    await ctx.reply(
      `Бот с расписанием занятий для группы ИПС311-2 (ММУ)\n\nПланы развития:\n- Улучшить качество пользования в личных чатах\n- Сделать рассылку расписания (раз в день/неделю)\n- Сделать настройки рассылки и уведомлений\n- Оптимизация работы бота\n\nТекущая версия: 1.0`,
    );
  }
}
