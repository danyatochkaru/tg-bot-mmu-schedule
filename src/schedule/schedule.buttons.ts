import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';
import { addDays, addWeeks, isThisWeek, isToday } from 'date-fns';

export const emptyController = () =>
  Markup.inlineKeyboard([Markup.button.callback('Меню', 'menu')]);

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
      Markup.button.callback('Неделя', `week-${formatDate(date)}`),
      Markup.button.callback('Сегодня', `day-current`, isToday(date)),
      Markup.button.callback('Меню', 'menu'),
    ],
  ]);

export const weekController = (
  date: Date,
  options?: { hasError?: boolean; days?: { date: Date; name: string }[] },
) => {
  const daysBtn = options?.days?.map((day) =>
    Markup.button.callback(day.name, `day-${formatDate(day.date)}`),
  );
  return Markup.inlineKeyboard([
    daysBtn,
    [
      Markup.button.callback(
        'Повторить попытку',
        `week-${formatDate(date)}`,
        !options.hasError,
      ),
    ],
    [
      Markup.button.callback('Пред.', `week-${formatDate(addWeeks(date, -1))}`),
      Markup.button.callback('След.', `week-${formatDate(addWeeks(date, 1))}`),
    ],
    [
      Markup.button.callback(
        'Текущая',
        `week-current`,
        isThisWeek(date, { weekStartsOn: 1 }),
      ),
      Markup.button.callback(
        'Сегодня',
        `day-current`,
        !isThisWeek(date, { weekStartsOn: 1 }),
      ),
      Markup.button.callback('Меню', 'menu'),
    ],
  ]);
};
