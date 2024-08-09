import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UsersService } from './users.service';
import { MESSAGES } from '../app.constants';
import { Logger } from '@nestjs/common';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class UsersUpdate {
  private logger = new Logger(UsersUpdate.name);

  constructor(private readonly usersService: UsersService) {}

  @Command('me')
  async getMe(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.message.from.id);
    await ctx.reply(
      user
        ? `id: ${user.id}\n` +
            `uid: ${user.uid}\n` +
            `username: ${user.username}\n` +
            `group: ${user.group_name}`
        : MESSAGES['ru'].NOT_REGISTERED,
    );
  }

  @Command('remove_me')
  async debugRemove(@Ctx() ctx: Context) {
    await this.usersService.remove(ctx.from.id);
    await ctx.reply(MESSAGES['ru'].PROFILE_REMOVED);
  }

  // @Command('send')
  async doMailing(@Ctx() ctx: Context) {
    const users = await this.usersService.getListForMailing(
      String(ctx.from.id),
    );

    if (
      !('reply_to_message' in ctx.message) ||
      !('text' in (ctx.message as { reply_to_message?: any })?.reply_to_message)
    ) {
      await ctx.reply(MESSAGES['ru'].ATTACHED_MESSAGE_FOR_MAILING_NOT_FOUND);
      return;
    }

    for (const user of users) {
      await ctx.telegram
        .sendMessage(
          parseInt(user.uid),
          [
            (ctx.message as { reply_to_message?: any })?.reply_to_message.text,
            MESSAGES['ru'].MAILING_UNSUBSCRIBE_INFO,
          ].join(`\n\n`),
          {
            entities: (ctx.message as { reply_to_message?: any })
              ?.reply_to_message.entities,
          },
        )
        .catch((err) => {
          this.logger.error('Error sending message');
          this.logger.error(JSON.stringify(err, undefined, 2));
        });
    }
  }
}
