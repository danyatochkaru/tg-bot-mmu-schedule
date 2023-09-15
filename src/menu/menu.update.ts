import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { theMenu } from './menu.buttons';
import { editMessage } from '../utils/editMessage';
import { MESSAGES } from '../app.constants';

@Update()
export class MenuUpdate {
  @Command(/menu/i)
  @Action('menu')
  async sendMenu(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, MESSAGES['ru'].MENU, {
        reply_markup: theMenu().reply_markup,
      });
    } else {
      await ctx.reply(MESSAGES['ru'].MENU, {
        reply_markup: theMenu().reply_markup,
      });
    }
  }
}
