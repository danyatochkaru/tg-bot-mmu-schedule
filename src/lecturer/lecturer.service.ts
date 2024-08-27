import { Injectable, Logger } from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { endOfWeek, startOfWeek } from 'date-fns';
import { LessonDto } from '../schedule/dto/Lesson.dto';
import { getDayOfWeek } from '../utils/getDayOfWeek';
import { declOfNum } from '../utils/declOfNum';
import { getWeekNumber } from '../utils/getWeekNumber';

@Injectable()
export class LecturerService {
  private logger = new Logger(LecturerService.name);

  constructor(private readonly apiService: ApiService) {}

  async getLecturerSchedule(
    lecturer_id: number,
    date: Date,
    type: 'day' | 'week' = 'week',
  ) {
    const start =
      type === 'day' ? date : startOfWeek(date, { weekStartsOn: 1 });
    const finish =
      type === 'day' ? start : endOfWeek(date, { weekStartsOn: 1 });
    return (await this.apiService.schedule({
      entity_id: lecturer_id,
      entity_type: 'lecturer',
      payload: { finish, start },
    })) as LessonDto[];
  }

  prepareTextMessageForLecturer(
    data: LessonDto[],
    date = new Date(),
    options = { hide_buildings: false },
  ) {
    if (!data || !Array.isArray(data)) {
      this.logger.error(`[prepareTextMessageForLecturer] data is not array`);
      this.logger.error(JSON.stringify(data, undefined, 2));
      return 'Произошла ошибка';
    }

    if (!data.length) {
      return [
        'В выбранный период пары не найдены',
        this.getWeekParity(date),
      ].join('\n\n');
    }

    const _preparedData = this.getPreparedData(data);

    return [
      `<b>${this.getLecturers(data).join(', ')}</b>`,
      _preparedData
        .map((i) =>
          [
            this.getFormattedDate(new Date(i.day)),
            this.getFormattedLessons(i.list, options.hide_buildings),
          ].join('\n\n'),
        )
        .join('\n\n'),
      this.getWeekParity(new Date(_preparedData[0].day)),
    ].join('\n\n');
  }

  private getShortBuilding(b: string) {
    return `${b
      .split(' ')
      .map((i) => i[0].toUpperCase())
      .join('')} | `;
  }

  private getFormattedLessons(lessons: LessonDto[], hide_buildings?: boolean) {
    return lessons
      .map(
        (cur) =>
          `${cur.lessonNumberStart} | ${cur.beginLesson} - ${
            cur.endLesson
          } | <i>${hide_buildings ? '' : this.getShortBuilding(cur.building)}${cur.auditorium}</i>\n<b>${
            cur.discipline
          }</b> (${cur.kindOfWork.substring(0, 3)}.)`,
      )
      .filter((i, p, a) => a.indexOf(i) == p)
      .join('\n');
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

  private getLecturers(data: LessonDto[]) {
    return data.map((i) => i.lecturer).filter((x, i, a) => a.indexOf(x) === i);
  }
}
