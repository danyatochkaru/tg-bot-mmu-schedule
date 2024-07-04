import { Ctx, Help, Message, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MESSAGES, SELECT_GROUP, TRANSLIT_ALPHABET } from './app.constants';
import { UsersService } from './users/users.service';
import { ApiService } from './api/api.service';

@Update()
export class AppUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiService: ApiService,
  ) {}

  @Start()
  async onStart(
    @Ctx() ctx: Context & { scene: any },
    @Message() msg: { text: string },
  ) {
    await ctx.reply(MESSAGES.ru.GREETING);

    console.log(msg);

    if (msg && msg.text.split(' ').length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_start, ...params] = msg.text.split(' ');

      for (const p in params) {
        const [key, value] = params[p].split('_');
        if (key && value) {
          if (key === 'group') {
            if (isNaN(Number(value))) {
              const translitted_group = value
                .split('')
                .reduce(
                  (acc, value) =>
                    acc + (TRANSLIT_ALPHABET['en_ru'][value] ?? value),
                  '',
                );

              const groups = await this.apiService.search({
                payload: { term: translitted_group, type: 'group' },
              });

              if (Array.isArray(groups) && groups.length === 1) {
                const user = ctx.from;
                const user_from_db = await this.usersService.getInfo(user.id);
                const payload = {
                  uid: String(user.id),
                  group_id: groups[0].id,
                  group_name: groups[0].label,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  username: user.username,
                };

                if (user_from_db) {
                  await this.usersService.editInfo(user.id, payload);
                } else {
                  await this.usersService.register(payload);
                }

                await ctx.reply(
                  MESSAGES['ru'].GROUP_SELECTED(groups[0].label),
                  {
                    parse_mode: 'HTML',
                  },
                );
                return;
              }
            }
          }
        }
      }
    }
    const user = await this.usersService.getInfo(ctx.from.id);
    if (!user) {
      await ctx.scene.enter(SELECT_GROUP);
    } else {
      await ctx.reply(MESSAGES['ru'].ALREADY_REGISTERED);
    }
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(MESSAGES['ru'].HELP_INFO, { parse_mode: 'HTML' });
  }
}
