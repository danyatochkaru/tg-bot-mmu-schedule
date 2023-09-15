import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { editMessage } from '../utils/editMessage';
import { settingsController } from './settings.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES, SELECT_GROUP } from '../app.constants';

@Update()
export class SettingsUpdate {
  constructor(private readonly usersService: UsersService) {}
  @Action('settings')
  async onSettings(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    if (!user) {
      await editMessage(ctx, MESSAGES['ru'].NOT_REGISTERED_FOR_SETTINGS);
      return;
    }

    await editMessage(ctx, MESSAGES['ru'].SETTINGS, {
      reply_markup: settingsController({ user }).reply_markup,
    });
  }

  @Action('change-group')
  async changeGroup(@Ctx() ctx: Context & { scene: any }) {
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await ctx.scene.enter(SELECT_GROUP);
  }

  @Action(/change-detail-week/i)
  async changeDetailWeek(@Ctx() ctx: Context) {
    const flag =
      (ctx.callbackQuery as { data: string }).data.split('=')[1] === 'true';
    const updated_user = await this.usersService.editInfo(ctx.from.id, {
      detail_week: flag,
    });
    await editMessage(
      ctx,
      MESSAGES['ru'].DETAIL_WEEK_SWITCHED(updated_user.detail_week),
      {
        reply_markup: settingsController({ user: updated_user }).reply_markup,
      },
    );
  }
}
