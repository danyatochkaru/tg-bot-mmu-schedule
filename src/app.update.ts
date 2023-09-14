import { Command, Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SELECT_GROUP } from './app.constants';
import { UsersService } from './users/users.service';

@Update()
export class AppUpdate {
  constructor(private readonly usersService: UsersService) {}

  // @Start()
  async onStart(@Ctx() ctx: Context & { scene: any }) {
    await ctx.reply('Привет!');
    const user = await this.usersService.getInfo(ctx.from.id);
    if (!user) {
      await ctx.scene.enter(SELECT_GROUP);
    } else {
      await ctx.reply(
        'Ты уже зарегистрирован!\n\nДля вызова меню напиши /menu',
      );
    }
  }

  @Command('enter_uid')
  async enterUid(@Ctx() ctx: Context & { command?: string; payload?: string }) {
    const payload = ctx.payload.split(' ');
    await this.usersService.editInfo(payload[0], {
      uid: payload[1],
    });
    return 'ok';
  }

  @On('text')
  async works(@Ctx() ctx: Context) {
    await ctx.reply(
      'Ведутся технические работы. Прошу прощения за предоставленные неудобства.',
    );
  }
}
