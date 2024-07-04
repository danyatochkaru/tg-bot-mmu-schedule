import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { editMessage } from '../utils/editMessage';
import { settingsController } from './settings.buttons';
import { UsersService } from '../users/users.service';
import { MESSAGES, SELECT_GROUP, TRANSLIT_ALPHABET } from '../app.constants';
import { Logger } from '@nestjs/common';
import Transliterator from '../utils/transliterator';

@Update()
// @UseInterceptors(new LoggingInterceptor())
export class SettingsUpdate {
  private logger = new Logger(SettingsUpdate.name);
  private transliterator = new Transliterator(TRANSLIT_ALPHABET);

  constructor(private readonly usersService: UsersService) {}
  @Action('settings')
  async onSettings(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    if (!user) {
      await editMessage(ctx, MESSAGES['ru'].NOT_REGISTERED_FOR_SETTINGS);
      return;
    }

    await editMessage(ctx, MESSAGES['ru'].SETTINGS, {
      reply_markup: settingsController({
        user,
      }).reply_markup,
      parse_mode: 'HTML',
    });
  }

  @Action('change-group')
  async changeGroup(@Ctx() ctx: Context & { scene: any }) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx
        .deleteMessage(ctx.callbackQuery.message.message_id)
        .catch((err) => err.error_code !== 400 && this.logger.error(err));
    }
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
        reply_markup: settingsController({
          user: updated_user,
        }).reply_markup,
        parse_mode: 'HTML',
      },
    );
  }

  @Action(/toggle_allow_mailing/i)
  async toggleAllowMailing(@Ctx() ctx: Context) {
    const flag =
      (ctx.callbackQuery as { data: string }).data.split('=')[1] === 'true';
    const updated_user = await this.usersService.editInfo(ctx.from.id, {
      allow_mailing: flag,
    });
    await editMessage(
      ctx,
      MESSAGES['ru'].ALLOW_MAILING_CHANGED(updated_user.allow_mailing),
      {
        reply_markup: settingsController({
          user: updated_user,
        }).reply_markup,
      },
    );
  }

  @Action('link-w-group')
  async getLinkWithGroup(@Ctx() ctx: Context) {
    const user = await this.usersService.getInfo(ctx.from.id);

    if (!user) {
      await editMessage(ctx, MESSAGES['ru'].NOT_REGISTERED_FOR_SETTINGS);
      return;
    }

    await ctx.reply(
      MESSAGES['ru'].LINK_WITH_GROUP(
        ctx.botInfo.username,
        this.transliterator.decode(user.group_name),
      ),
      {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true
        }
      },
    );
  }
}
