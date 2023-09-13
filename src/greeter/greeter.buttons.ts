import { Markup } from 'telegraf';

export function searchingGroupList(groups: { label: string; id: number }[]) {
  return Markup.inlineKeyboard(
    groups.map((group) =>
      Markup.button.callback(group.label, `group-${group.id}:${group.label}`),
    ),
    { columns: 2 },
  );
}
