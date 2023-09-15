import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MESSAGES, SELECT_GROUP } from './app.constants';
import { UsersService } from './users/users.service';

@Update()
export class AppUpdate {
  constructor(private readonly usersService: UsersService) {}

  @Start()
  async onStart(@Ctx() ctx: Context & { scene: any }) {
    await ctx.reply('Привет!');
    const user = await this.usersService.getInfo(ctx.from.id);
    if (!user) {
      await ctx.scene.enter(SELECT_GROUP);
    } else {
      await ctx.reply(MESSAGES['ru'].ALREADY_REGISTERED);
    }
  }
}
