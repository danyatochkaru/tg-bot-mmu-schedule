import { getDay, isValid } from 'date-fns';

export function getDayOfWeek(date: Date) {
  return (
    isValid(new Date(date)) &&
    [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ][getDay(new Date(date))]
  );
}
