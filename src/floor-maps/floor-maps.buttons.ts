import { Markup } from 'telegraf';

export const floorMapsMenuButtons = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('1 этаж', 'floor-1'),
      Markup.button.callback('2 этаж', 'floor-2'),
      Markup.button.callback('3 этаж', 'floor-3'),
    ],
    [
      Markup.button.callback('4 этаж', 'floor-4'),
      Markup.button.callback('5 этаж', 'floor-5'),
      Markup.button.callback('6 этаж', 'floor-6'),
    ],
    [Markup.button.callback('Меню', 'menu')],
  ]);
