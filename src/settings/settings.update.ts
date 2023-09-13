import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { editMessage } from '../utils/eidtMessage';
import { settingsController } from './settings.buttons';
import { UsersService } from '../users/users.service';
import { SELECT_GROUP } from '../app.constants';

@Update()
export class SettingsUpdate {
  constructor(private readonly usersService: UsersService) {}
  @Action('settings')
  async onSettings(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    if (!user) {
      await editMessage(
        ctx,
        'Чтобы что-то менять, нужно сначала это что-то создать. Пройти регистрацию: /start',
      );
      return;
    }

    await editMessage(ctx, 'Настройки', {
      reply_markup: settingsController({ user }).reply_markup,
    });
  }

  @Action('change-group')
  async changeGroup(@Ctx() ctx: Context & { scene: any }) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await ctx.scene.enter(SELECT_GROUP);
  }
}
