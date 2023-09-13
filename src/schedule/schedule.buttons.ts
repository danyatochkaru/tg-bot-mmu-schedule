import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';
import { addDays, addWeeks, isThisWeek, isToday } from 'date-fns';

export const dayController = (date: Date, hasError = false) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Повторить попытку',
        `day-${formatDate(date)}`,
        !hasError,
      ),
    ],
    [
      Markup.button.callback('Пред.', `day-${formatDate(addDays(date, -1))}`),
      Markup.button.callback('След.', `day-${formatDate(addDays(date, 1))}`),
    ],
    [
      Markup.button.callback(
        'Сегодня',
        `day-${formatDate(new Date())}`,
        isToday(date),
      ),
      Markup.button.callback('Меню', 'menu'),
    ],
  ]);

export const weekController = (date: Date, hasError = false) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Повторить попытку',
        `week-${formatDate(date)}`,
        !hasError,
      ),
    ],
    [
      Markup.button.callback('Пред.', `week-${formatDate(addWeeks(date, -1))}`),
      Markup.button.callback('След.', `week-${formatDate(addWeeks(date, 1))}`),
    ],
    [
      Markup.button.callback(
        'Текущая',
        `week-${formatDate(new Date())}`,
        isThisWeek(date),
      ),
      Markup.button.callback('Меню', 'menu'),
    ],
  ]);
