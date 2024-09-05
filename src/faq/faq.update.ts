import { Logger } from '@nestjs/common';
import { Action, Command, Ctx, Hears, Update } from 'nestjs-telegraf';
import { FaqService } from './faq.service';
import { UsersService } from '../users/users.service';
import { Context } from 'telegraf';
import { MESSAGES } from '../app.constants';
import { editMessage } from '../utils/editMessage';
import { faqButtons } from './faq.buttons';
import * as telegramifyMarkdown from 'telegramify-markdown';

@Update()
export class FaqUpdate {
  private logger = new Logger(FaqUpdate.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly faqService: FaqService,
  ) {}

  @Hears(/^faq$/i)
  @Command(/^faq$/i)
  @Action('faq')
  async getFaq(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    const [faqData] = await this.faqService.getFaq([user?.language || 'ru']);
    if (
      ctx.callbackQuery &&
      'data' in ctx.callbackQuery &&
      'text' in ctx.callbackQuery.message
    ) {
      await editMessage(
        ctx,
        faqData?.value
          ? telegramifyMarkdown(faqData.value)
          : MESSAGES[user?.language || 'ru'].FAQ_TEXT_NOT_FOUND,
        {
          reply_markup: faqButtons.reply_markup,
          parse_mode: 'MarkdownV2',
          link_preview_options: { is_disabled: true },
        },
      );
    } else {
      await ctx
        .reply(
          faqData?.value
            ? telegramifyMarkdown(faqData.value)
            : MESSAGES[user?.language || 'ru'].FAQ_TEXT_NOT_FOUND,
          {
            reply_markup: faqButtons.reply_markup,
            parse_mode: 'MarkdownV2',
            link_preview_options: { is_disabled: true },
          },
        )
        .catch((err) => this.logger.error(JSON.stringify(err, undefined, 2)));
    }
  }
}
