import { Markup } from 'telegraf';
import { formatDate } from '../utils/formatDate';
import { addWeeks, isThisWeek } from 'date-fns';

export const searchingLecturerList = (
  lecturers: { label: string; id: number }[],
) =>
  Markup.inlineKeyboard(
    [
      ...lecturers.map((lecturer) =>
        Markup.button.callback(
          lecturer.label,
          `lecturer-search-${lecturer.id}`,
        ),
      ),
      Markup.button.callback('Отмена', 'cancel'),
    ],
    { columns: 1 },
  );

export const requestLecturerSchedule = (lecturer_id: number, date: Date) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Получить расписание',
        `lecturer-${lecturer_id}-${formatDate(date)}-nm`,
      ),
    ],
    [Markup.button.callback('Выбрать другого', 'lecturer')],
  ]);

export const lecturerController = (
  lecturer_id: number,
  date: Date,
  hasError = false,
) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Повторить попытку',
        `lecturer-${lecturer_id}-${formatDate(date)}`,
        !hasError,
      ),
    ],
    [
      Markup.button.callback(
        'Пред.',
        `lecturer-${lecturer_id}-${formatDate(addWeeks(date, -1))}`,
      ),
      Markup.button.callback(
        'След.',
        `lecturer-${lecturer_id}-${formatDate(addWeeks(date, 1))}`,
      ),
    ],
    [
      Markup.button.callback(
        'Текущая',
        `lecturer-${lecturer_id}-current`,
        isThisWeek(date, { weekStartsOn: 1 }),
      ),
      Markup.button.callback('Меню', 'menu'),
    ],
  ]);
