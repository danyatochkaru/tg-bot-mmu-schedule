import { Action, Command, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { theMenu } from './menu.buttons';
import { editMessage } from '../utils/editMessage';
import { MESSAGES, TRANSLIT_ALPHABET } from '../app.constants';
import { Logger } from '@nestjs/common';
import Transliterator from '../utils/transliterator';
import { UsersService } from '../users/users.service';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class MenuUpdate {
  private logger = new Logger(MenuUpdate.name);
  private transliterator = new Transliterator(TRANSLIT_ALPHABET);

  constructor(private readonly usersService: UsersService) {}

  @Hears(/^меню$/i)
  @Command(/^menu$/i)
  @Action('menu')
  async sendMenu(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    if (
      ctx.callbackQuery &&
      'data' in ctx.callbackQuery &&
      'text' in ctx.callbackQuery.message
    ) {
      await editMessage(ctx, MESSAGES['ru'].MENU, {
        reply_markup: theMenu({
          link: `t.me/${ctx.botInfo.username}?start${user ? `=group_${this.transliterator.decode(user.group_name)}` : ''}`,
        }).reply_markup,
      });
    } else {
      await ctx
        .reply(MESSAGES['ru'].MENU, {
          reply_markup: theMenu({
            link: `t.me/${ctx.botInfo.username}?start${user ? `=group_${this.transliterator.decode(user.group_name)}` : ''}`,
          }).reply_markup,
        })
        .catch((err) => this.logger.error(JSON.stringify(err, undefined, 2)));
    }
  }
}
