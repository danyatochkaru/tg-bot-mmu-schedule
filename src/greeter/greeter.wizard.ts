import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { SELECT_GROUP } from '../app.constants';
import { WizardContext } from 'telegraf/typings/scenes';
import axios from 'axios';
import * as process from 'process';
import { editMessage } from '../utils/eidtMessage';
import { UsersService } from '../users/users.service';
import { searchingGroupList } from './greeter.buttons';

@Wizard(SELECT_GROUP)
export class GreeterWizard {
  constructor(private readonly usersService: UsersService) {}

  @WizardStep(1)
  async onStart(@Ctx() ctx: WizardContext) {
    ctx.wizard.next();
    return 'Напиши свою группу';
  }

  @On('text')
  @WizardStep(2)
  async onMessage(@Ctx() ctx: WizardContext, @Message() msg: { text: string }) {
    const message = await ctx.reply('Идёт поиск...');
    const groups = await axios
      .get(
        `https://${process.env.AUTH}@${
          process.env.URL
        }search?term=${encodeURIComponent(msg.text)}&type=group`,
      )
      .then((res) => res.data)
      .catch((err) => {
        console.error(err);
        return 'Ошибка сервера';
      });

    if (typeof groups === 'string') {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        'Произошла ошибка. Повтори попытку',
      );
    } else {
      if (groups.length) {
        if (groups.length > 8) {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            message.message_id,
            undefined,
            'Слишком много подходящих групп. Напиши поточнее',
          );
        } else {
          ctx.wizard.next();
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            message.message_id,
            undefined,
            `Выбери группу:`,
            {
              reply_markup: searchingGroupList(groups).reply_markup,
            },
          );
        }
      } else {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          message.message_id,
          undefined,
          'Группа с таким названием не найдена. Повтори попытку',
        );
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
        uid: user.id,
        group_id: parseInt(group_id),
        group_name,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      });
    }
    await ctx.scene.leave();
    await editMessage(
      ctx,
      `Выбрана группа <b>${group_name}</b>\n\nДля вызова меню напиши /menu`,
      {
        parse_mode: 'HTML',
      },
    );
  }
}
