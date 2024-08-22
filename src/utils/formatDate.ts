import { format, isValid } from 'date-fns';
import { ru as ruLocale } from 'date-fns/locale/ru';

export function formatDate(date: Date | string | number) {
  return (
    isValid(new Date(date)) &&
    format(new Date(date), 'yyyy.MM.dd', { locale: ruLocale, weekStartsOn: 1 })
  );
}
