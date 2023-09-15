import { getDay, isValid } from 'date-fns';
import { MESSAGES } from '../app.constants';

export function getDayOfWeek(date: Date, short = false) {
  return (
    isValid(new Date(date)) &&
    (short ? MESSAGES['ru'].DAYS_WEEK_SHORT : MESSAGES['ru'].DAYS_WEEK)[
      getDay(new Date(date))
    ]
  );
}
