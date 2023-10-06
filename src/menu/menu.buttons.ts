import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';

export const theMenu = (date = new Date()) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('На день', `day-${formatDate(date)}`),

      Markup.button.callback('На неделю', `week-${formatDate(date)}`),
    ],
    [Markup.button.callback('Преподаватель', 'lecturer')],
    [Markup.button.url('Сайт с расписанием', `https://schedule.mi.university`)],
    [
      Markup.button.callback('Настройки', `settings`),
      Markup.button.url('Автор', 'https://danyatochka.ru'),
    ],
  ]);
