import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { theMenu } from './menu.buttons';
import { editMessage } from '../utils/eidtMessage';

@Update()
export class MenuUpdate {
  @Command(/menu/i)
  @Action('menu')
  async sendMenu(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, 'Меню', { reply_markup: theMenu().reply_markup });
    } else {
      await ctx.reply('Меню', { reply_markup: theMenu().reply_markup });
    }
  }
}
