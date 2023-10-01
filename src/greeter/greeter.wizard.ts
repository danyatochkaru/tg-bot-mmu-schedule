import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { MESSAGES, SELECT_GROUP } from '../app.constants';
import { WizardContext } from 'telegraf/typings/scenes';
import { editMessage } from '../utils/editMessage';
import { UsersService } from '../users/users.service';
import { searchingGroupList } from './greeter.buttons';
import { fetcher } from '../utils/fetcher';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Wizard(SELECT_GROUP)
export class GreeterWizard {
  private logger = new Logger(GreeterWizard.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @WizardStep(1)
  async onStart(@Ctx() ctx: WizardContext) {
    ctx.wizard.next();
    return MESSAGES['ru'].ENTER_GROUP;
  }

  @On('text')
  @WizardStep(2)
  async onMessage(@Ctx() ctx: WizardContext, @Message() msg: { text: string }) {
    const message = await ctx.reply(MESSAGES['ru'].SEARCHING);
    const groups = await fetcher(this.configService)
      .get(`search?term=${encodeURIComponent(msg.text)}&type=group`)
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err);
        return 'Ошибка сервера';
      });

    if (typeof groups === 'string') {
      await editMessage(ctx, MESSAGES['ru'].ERROR_RETRY, {}, message);
    } else {
      if (groups.length) {
        if (groups.length > 8) {
          await editMessage(ctx, MESSAGES['ru'].MANY_GROUPS_FOUND, {}, message);
        } else {
          ctx.wizard.next();
          await editMessage(
            ctx,
            MESSAGES['ru'].SELECT_GROUP,
            {
              reply_markup: searchingGroupList(groups).reply_markup,
            },
            message,
          );
        }
      } else {
        await editMessage(ctx, MESSAGES['ru'].NO_GROUPS_FOUND, {}, message);
      }
    }
  }

  @Action(/group-/i)
  @WizardStep(3)
  async onGroupSelect(@Ctx() ctx: WizardContext) {
    const user = ctx.callbackQuery.from,
      [group_id, group_name] = (ctx.callbackQuery as { data: string }).data
        .replace('group-', '')
        .split(':');

    const user_from_db = await this.usersService.getInfo(user.id);
    if (user_from_db) {
      await this.usersService.editInfo(user.id, {
        group_id: parseInt(group_id),
        group_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
    } else {
      await this.usersService.register({
        uid: String(user.id),
        group_id: parseInt(group_id),
        group_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
    }
    await ctx.scene.leave();
    await editMessage(ctx, MESSAGES['ru'].GROUP_SELECTED(group_name), {
      parse_mode: 'HTML',
    });
  }
}
