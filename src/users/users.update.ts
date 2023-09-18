import { Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UsersService } from './users.service';
import { MESSAGES } from '../app.constants';

@Update()
export class UsersUpdate {
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
}