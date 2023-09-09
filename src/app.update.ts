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
          console.error(err);
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
      await ctx.telegram
        .editMessageText(
          ctx.chat.id,
          ctx.callbackQuery.message.message_id,
          undefined,
          'Получаю данные...',
        )
        .catch((err) => {
          console.error(err);
        });
      const payload = ctx.callbackQuery.data.replace('day-', '');
      const date = new Date(payload === 'current' ? Date.now() : payload);
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
            `В выбранный вами период пары не найдены`,
            date,
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
            reply_markup: day(date).reply_markup,
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
          if (isValid(chrono.ru.parseDate(ctx.payload))) {
            const message = await ctx.reply('Получаю данные...');
            const date = chrono.ru.parseDate(ctx.payload);

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
            await ctx.telegram
              .editMessageText(
                ctx.chat.id,
                message.message_id,
                undefined,
                answerText,
                {
                  parse_mode: 'HTML',
                  reply_markup: day(date).reply_markup,
                },
              )
              .catch((err) => {
                console.error(err);
              });
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
        await ctx.telegram
          .editMessageText(
            ctx.chat.id,
            message.message_id,
            undefined,
            answerText,
            { parse_mode: 'HTML', reply_markup: day(date).reply_markup },
          )
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }

  @Command(/week/gi)
  @Action(/week-/gi)
  async getWeek(@Ctx() ctx: Context) {
    let date: Date, message;
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      message = await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        undefined,
        'Получаю данные...',
      );
      const payload = ctx.callbackQuery.data.replace('week-', '');
      date = new Date(payload === 'current' ? Date.now() : payload);
    } else {
      message = await ctx.reply('Получаю данные...');
      date = new Date();
    }

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
    await ctx.telegram
      .editMessageText(ctx.chat.id, message.message_id, undefined, answerText, {
        parse_mode: 'HTML',
        reply_markup: week(date).reply_markup,
      })
      .catch((err) => {
        console.error(err);
      });
  }

  @Command('info')
  async info(@Ctx() ctx: Context) {
    await ctx.reply(
      'Бот с расписанием занятий для группы ИПС311-2 (ММУ)\n\n' +
        'Планы развития:\n' +
        '- Улучшить качество пользования в личных чатах\n' +
        '- Сделать рассылку расписания (раз в день/неделю)\n' +
        '- Сделать настройки рассылки и уведомлений\n' +
        '- Оптимизация работы бота\n\n' +
        'Текущая версия: 1.2',
    );
  }
}
