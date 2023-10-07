import { Markup } from 'telegraf';

export const theMenu = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('На день', `day-current`),

      Markup.button.callback('На неделю', `week-current`),
    ],
    [Markup.button.callback('Преподаватель', 'lecturer')],
    [Markup.button.url('Сайт с расписанием', `https://schedule.mi.university`)],
    [
      Markup.button.callback('Настройки', `settings`),
      Markup.button.url('Автор', 'https://danyatochka.ru'),
    ],
  ]);
