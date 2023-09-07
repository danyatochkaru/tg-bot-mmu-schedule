import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  format,
  getDay,
  getWeek,
  isValid,
  startOfToday,
  startOfTomorrow,
} from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import * as process from 'process';

@Injectable()
export class AppService {
  async getScheduleFromSite(payload?: {
    today?: boolean;
    tomorrow?: boolean;
    finish?: Date;
    start?: Date;
  }) {
    let query: Record<string, string | number> = {};

    if (payload) {
      'finish' in payload &&
        (query = Object.assign({}, query, {
          finish: this.formatDate(payload.finish),
        }));
      'start' in payload &&
        (query = Object.assign({}, query, {
          start: this.formatDate(payload.start),
        }));
      'today' in payload &&
        payload.today &&
        (query = Object.assign({}, query, {
          start: this.formatDate(startOfToday()),
          finish: this.formatDate(startOfToday()),
        }));
      'tomorrow' in payload &&
        payload.tomorrow &&
        (query = Object.assign({}, query, {
          start: this.formatDate(startOfTomorrow()),
          finish: this.formatDate(startOfTomorrow()),
        }));
    }

    const qs =
      '?' +
      Object.keys(query)
        .map((key) => `${key}=${encodeURIComponent(query[key])}`)
        .join('&');

    return await axios(
      `https://${process.env.AUTH}@${process.env.URL}${process.env.GROUP_ID}${qs}`,
    )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
        return 'Произошла обибка';
      });
  }

  formatDate(date: Date) {
    return format(new Date(date), 'yyyy.MM.dd', { locale: ruLocale });
  }

  getDayOfWeek(date: Date) {
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

  getWeekNumber(date: Date) {
    return getWeek(new Date(date), { locale: ruLocale, weekStartsOn: 1 });
  }

  wrapInfo(content: string | number, date: Date = new Date()) {
    return `<i>${this.getDayOfWeek(new Date(date))} (${new Date(
      date,
    ).toLocaleDateString('RU-ru')})</i>\n${content}\n<i>${
      this.getWeekNumber(date) % 2 ? 'Чётная' : 'Нечётная'
    } неделя</i>`;
  }

  formatSchedule(data: any[]) {
    return data && Array.isArray(data)
      ? data
          .map(
            (i: { day: Date; list: any[] }) =>
              `<i>${this.getDayOfWeek(i.day)} (${new Date(
                i.day,
              ).toLocaleDateString('RU-ru')})</i>\n${i.list
                .map((cur, index, arr) =>
                  index > 0 && arr[index - 1].beginLesson === cur.beginLesson
                    ? `${cur.auditorium} - ${cur.lecturer}`
                    : `\n${cur.lessonNumberStart} | ${cur.beginLesson} - ${
                        cur.endLesson
                      }\n<b>${cur.discipline}</b> (${cur.kindOfWork.substring(
                        0,
                        3,
                      )}.)\n${cur.auditorium} - ${cur.lecturer}`,
                )
                .join('\n')}`,
          )
          .join('\n\n') +
          `\n\n<i>${
            this.getWeekNumber(data[0].day) % 2 ? 'Чётная' : 'Нечётная'
          } неделя</i>`
      : 'Произошла ошибка :(';
  }

  formatData(data: any[]) {
    return data && Array.isArray(data)
      ? data
          .map((i: { date: any }) => i.date)
          .filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i)
          .map((day: any) => ({
            day,
            list: data.filter((current: { date: any }) => current.date === day),
          }))
      : 'Произошла ошибка :(';
  }
}
