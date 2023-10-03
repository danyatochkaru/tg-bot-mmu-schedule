import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { MESSAGES, SELECT_GROUP } from '../app.constants';
import { WizardContext } from 'telegraf/typings/scenes';
import { editMessage } from '../utils/editMessage';
import { UsersService } from '../users/users.service';
import { searchingGroupList } from './greeter.buttons';
import { ApiService } from '../api/api.service';

@Wizard(SELECT_GROUP)
export class GreeterWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiService: ApiService,
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
    const groups = await this.apiService.search({
      payload: { term: msg.text, type: 'group' },
    });

    if (groups instanceof Error) {
      await editMessage(ctx, MESSAGES['ru'].ERROR_RETRY, {}, message);
      return;
    }

    if (!groups.length) {
      await editMessage(ctx, MESSAGES['ru'].NO_GROUPS_FOUND, {}, message);
      return;
    }

    if (groups.length > 8) {
      await editMessage(ctx, MESSAGES['ru'].MANY_GROUPS_FOUND, {}, message);
      return;
    }

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

  @Action(/group-/i)
  @WizardStep(3)
  async onGroupSelect(@Ctx() ctx: WizardContext) {
    const user = ctx.callbackQuery.from,
      [group_id, group_name] = (ctx.callbackQuery as { data: string }).data
        .replace('group-', '')
        .split(':');

    const user_from_db = await this.usersService.getInfo(user.id);
    const payload = {
      uid: String(user.id),
      group_id: parseInt(group_id),
      group_name,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
    };

    if (user_from_db) {
      await this.usersService.editInfo(user.id, payload);
    } else {
      await this.usersService.register(payload);
    }

    await ctx.scene.leave();
    await editMessage(ctx, MESSAGES['ru'].GROUP_SELECTED(group_name), {
      parse_mode: 'HTML',
    });
  }
}
