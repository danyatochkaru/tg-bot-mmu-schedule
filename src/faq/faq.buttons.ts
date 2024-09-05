import { Markup } from 'telegraf';

export const faqButtons = Markup.inlineKeyboard([
  [Markup.button.callback('Меню', 'menu')],
]);
