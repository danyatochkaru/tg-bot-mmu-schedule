import { Markup } from 'telegraf';
import { UserEntity } from '../users/user.entity';

export function settingsController({ user }: { user: Partial<UserEntity> }) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        `Сменить группу | ${user.group_name}`,
        'change-group',
      ),
    ],
    [
      Markup.button.callback(
        `Подробная неделя | ${user.detail_week ? 'Вкл' : 'Выкл'}`,
        `change-detail-week=${!user.detail_week}`,
      ),
    ],
    [Markup.button.callback('Меню', 'menu')],
  ]);
}
