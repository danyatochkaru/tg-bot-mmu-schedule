import { Markup } from 'telegraf';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';

export function menu() {
  const date = new Date();
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        'Расписание на день',
        `day-${format(date, 'yyyy.MM.dd', { locale: ruLocale })}`,
      ),
      Markup.button.callback(
        'Расписание на неделю',
        `week-${format(startOfWeek(date), 'yyyy.MM.dd', { locale: ruLocale })}`,
      ),
    ],
    { columns: 1 },
  );
}

export function day(date: Date) {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        'Предыдущий',
        `day-${format(addDays(date, -1), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback(
        'Следующий',
        `day-${format(addDays(date, 1), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback(
        'Сегодня',
        `day-${format(new Date(), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback('Меню', `menu`),
    ],
    { columns: 2 },
  );
}

export function week(date: Date) {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback(
        'Предыдущая',
        `week-${format(addWeeks(date, -1), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback(
        'Следующая',
        `week-${format(addWeeks(date, 1), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback(
        'Текущая',
        `week-${format(startOfWeek(new Date()), 'yyyy.MM.dd', {
          locale: ruLocale,
        })}`,
      ),
      Markup.button.callback('Меню', `menu`),
    ],
    { columns: 2 },
  );
}
