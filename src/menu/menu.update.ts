import { Action, Command, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { theMenu } from './menu.buttons';
import { editMessage } from '../utils/editMessage';
import { MESSAGES } from '../app.constants';
import { Logger } from '@nestjs/common';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class MenuUpdate {
  private logger = new Logger(MenuUpdate.name);

  @Hears(/^меню$/i)
  @Command(/^menu$/i)
  @Action('menu')
  async sendMenu(@Ctx() ctx: Context) {
    if (
      ctx.callbackQuery &&
      'data' in ctx.callbackQuery &&
      'text' in ctx.callbackQuery.message
    ) {
      await editMessage(ctx, MESSAGES['ru'].MENU, {
        reply_markup: theMenu().reply_markup,
      });
    } else {
      await ctx
        .reply(MESSAGES['ru'].MENU, {
          reply_markup: theMenu().reply_markup,
        })
        .catch((err) => this.logger.error(JSON.stringify(err, undefined, 2)));
    }
  }
}
