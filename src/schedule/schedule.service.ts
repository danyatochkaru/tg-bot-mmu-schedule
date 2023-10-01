import { Injectable, Logger } from '@nestjs/common';
import { formatDate } from '../utils/formatDate';
import { endOfWeek, startOfWeek } from 'date-fns';
import { getDayOfWeek } from '../utils/getDayOfWeek';
import { getWeekNumber } from '../utils/getWeekNumber';
import { LessonDto } from './dto/Lesson.dto';
import { declOfNum } from '../utils/declOfNum';
import { fetcher } from '../utils/fetcher';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScheduleService {
  private logger = new Logger(ScheduleService.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchSchedule(
    group_id: number,
    date: Date,
    type: 'day' | 'week' = 'day',
  ): Promise<LessonDto[] | { error: any }> {
    const start = formatDate(
        type === 'day' ? date : startOfWeek(date, { weekStartsOn: 1 }),
      ),
      finish = formatDate(
        type === 'day' ? start : endOfWeek(date, { weekStartsOn: 1 }),
      );
    return await fetcher(this.configService)
      .get(
        `schedule/group/${String(group_id)}/?start=${start}&finish=${finish}`,
      )
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err);
        console.log(err);
        return { error: err };
      });
  }

  async fetchScheduleByDates(
    group_id: number,
    dates: { start: Date; end?: Date }[],
  ) {
    return Promise.all(
      dates.map(
        async (d) =>
          await fetcher(this.configService)
            .get(
              `schedule/group/${String(group_id)}/?start=${formatDate(
                d.start,
              )}&finish=${formatDate(d.end ?? d.start)}`,
            )
            .then((res) => res.data)
            .catch((err) => {
              this.logger.error(err);
              return { date: d.start, error: err };
            }),
      ),
    );
  }

  prepareTextMessageForDay(data: LessonDto[], date = new Date()) {
    if (!data || !Array.isArray(data)) {
      this.logger.error(`[prepareTextMessage] data is not array\n`, data);
      return 'Произошла ошибка';
    }

    if (!data.length) {
      return [
        this.getFormattedDate(date),
        'В выбранный период пары не найдены',
        this.getWeekParity(date),
      ].join('\n\n');
    }

    function getFormattedLessons(lessons: LessonDto[]) {
      return lessons
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
        .join('\n');
    }

    const _preparedData = this.getPreparedData(data);

    return [
      _preparedData
        .map((i) =>
          [
            this.getFormattedDate(new Date(i.day)),
            getFormattedLessons(i.list),
          ].join('\n'),
        )
        .join('\n\n'),
      this.getWeekParity(new Date(_preparedData[0].day)),
    ].join('\n\n');
  }

  prepareTextMessageForWeek(data: LessonDto[], date = new Date()) {
    if (!data || !Array.isArray(data)) {
      this.logger.error(`[prepareTextMessage] data is not array\n`, data);
      return 'Произошла ошибка';
    }

    if (!data.length) {
      return [
        this.getFormattedDate(date),
        'В выбранный период пары не найдены',
        this.getWeekParity(date),
      ].join('\n\n');
    }

    function getFormattedDays(lessons: LessonDto[]) {
      return lessons
        .map((cur, index, arr) =>
          index > 0 && arr[index - 1].beginLesson === cur.beginLesson
            ? `<i>, ${cur.auditorium}</i>`
            : `\n${cur.lessonNumberStart} | <b>${
                cur.discipline
              }</b> (${cur.kindOfWork.substring(0, 3)}.) - <i>${
                cur.auditorium
              }</i>`,
        )
        .join('');
    }

    const _preparedData = this.getPreparedData(data);

    return [
      _preparedData
        .map((i) =>
          [
            this.getFormattedDate(
              new Date(i.day),
              // i.list
              //   .map((i) => `${i.lessonNumberStart}${i.discipline}`)
              //   .filter((x, i, a) => a.indexOf(x) === i).length,
            ),
            getFormattedDays(i.list),
          ].join('\n'),
        )
        .join('\n\n'),
      this.getWeekParity(new Date(_preparedData[0].day)),
    ].join('\n\n');
  }

  private getFormattedDate(date: Date, count = 0) {
    return `<i>${getDayOfWeek(date)} (${date.toLocaleDateString('RU-ru')})${
      count > 0
        ? ` - ${count} ${declOfNum(count, ['пара', 'пары', 'пар'])}`
        : ''
    }</i>`;
  }

  private getWeekParity(date: Date) {
    return `<i>${getWeekNumber(date) % 2 ? 'Чётная' : 'Нечётная'} неделя</i>`;
  }

  private getPreparedData(data: LessonDto[]) {
    return data
      .map((i) => i.date)
      .filter((x, i, a) => a.indexOf(x) === i)
      .map((day) => ({
        day,
        list: data.filter((current) => current.date === day),
      }));
  }
}
