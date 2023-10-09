import { Markup } from 'telegraf';

export const searchingGroupList = (groups: { label: string; id: number }[]) =>
  Markup.inlineKeyboard(
    [
      ...groups.map((group) =>
        Markup.button.callback(group.label, `group-search-${group.id}`),
      ),
      Markup.button.callback('Отмена', 'cancel'),
    ],
    { columns: 2 },
  );
