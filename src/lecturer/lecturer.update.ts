import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MESSAGES, SELECT_LECTURER } from '../app.constants';
import { Logger } from '@nestjs/common';
import { editMessage } from '../utils/editMessage';
import { LecturerService } from './lecturer.service';
import { lecturerController } from './lecturer.buttons';
import { ExtraEditMessageText } from 'telegraf/src/telegram-types';

@Update()
export class LecturerUpdate {
  private logger = new Logger(LecturerUpdate.name);

  constructor(private readonly lecturerService: LecturerService) {}

  @Command(/lecturer/i)
  @Action('lecturer')
  async searchLecturer(@Ctx() ctx: Context & { scene: any }) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx
        .deleteMessage(ctx.callbackQuery.message.message_id)
        .catch((err) => this.logger.error(err));
    }

    await ctx.scene.enter(SELECT_LECTURER);
  }

  @Action(/lecturer-/i)
  async getLecturerSchedule(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_keyword, lecturer_id, _date, new_message] =
        ctx.callbackQuery.data.split('-');

      const message = new_message
        ? await ctx.reply(MESSAGES['ru'].FETCHING)
        : await editMessage(ctx, MESSAGES['ru'].FETCHING);

      const date = new Date(_date === 'current' ? Date.now() : _date);

      const data = await this.lecturerService.getLecturerSchedule(
        parseInt(lecturer_id),
        date,
      );

      const text =
        data instanceof Error
          ? MESSAGES['ru'].NO_ANSWER_RETRY
          : this.lecturerService.prepareTextMessageForLecturer(data, date);
      const options: ExtraEditMessageText = {
        reply_markup: lecturerController(
          parseInt(lecturer_id),
          date,
          data instanceof Error,
        ).reply_markup,
        parse_mode: 'HTML',
      };

      if (new_message) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          (message as { message_id: number }).message_id,
          undefined,
          text,
          options,
        );
        return;
      }

      await editMessage(ctx, text, options);
    }
  }
}
