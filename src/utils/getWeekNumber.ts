import { getWeek } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';

export function getWeekNumber(date: Date) {
  return getWeek(new Date(date), { locale: ruLocale, weekStartsOn: 1 });
}
