import { Injectable, Logger } from '@nestjs/common';
import { endOfWeek, startOfWeek } from 'date-fns';
import { getDayOfWeek } from '../utils/getDayOfWeek';
import { getWeekNumber } from '../utils/getWeekNumber';
import { LessonDto } from './dto/Lesson.dto';
import { declOfNum } from '../utils/declOfNum';
import { ApiService } from '../api/api.service';

@Injectable()
export class ScheduleService {
  private logger = new Logger(ScheduleService.name);

  constructor(private readonly apiService: ApiService) {}

  async fetchSchedule(
    group_id: number,
    date: Date,
    type: 'day' | 'week' = 'day',
  ): Promise<LessonDto[] | Error> {
    const start =
      type === 'day' ? date : startOfWeek(date, { weekStartsOn: 1 });
    const finish =
      type === 'day' ? start : endOfWeek(date, { weekStartsOn: 1 });
    return await this.apiService.schedule({
      entity_id: group_id,
      entity_type: 'group',
      payload: { finish, start },
    });
  }

  async fetchScheduleByDates(
    group_id: number,
    dates: { start: Date; end?: Date }[],
  ) {
    return Promise.all(
      dates.map(
        async (d) =>
          (await this.apiService.schedule({
            entity_id: group_id,
            entity_type: 'group',
            payload: { finish: d.end ?? d.start, start: d.start },
          })) as LessonDto[] | Error,
      ),
    );
  }

  prepareTextMessageForDay(data: LessonDto[], date = new Date()) {
    if (!data || !Array.isArray(data)) {
      this.logger.error(`[prepareTextMessageForDay] data is not array`);
      this.logger.error(JSON.stringify(data, undefined, 2));
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
      this.logger.error(`[prepareTextMessageForWeek] data is not array`);
      this.logger.error(JSON.stringify(data, undefined, 2));
      return 'Произошла ошибка';
    }

    if (!data.length) {
      return [
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
