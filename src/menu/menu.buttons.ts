import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';

export const theMenu = (date = new Date()) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('Расписание на день', `day-${formatDate(date)}`)],
    [
      Markup.button.callback(
        'Расписание на неделю',
        `week-${formatDate(date)}`,
      ),
    ],
    [
      Markup.button.callback('Настройки', `settings`),
      Markup.button.url('Автор', 'https://danyatochka.ru'),
    ],
  ]);
