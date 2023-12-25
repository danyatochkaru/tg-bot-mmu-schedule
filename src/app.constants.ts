export const SELECT_GROUP = 'select-group';
export const SELECT_LECTURER = 'select-lecturer';

export const MESSAGES = {
  ru: {
    ALLOW_MAILING_CHANGED: (flag: boolean) =>
      `Получение рассылок ${flag ? 'включено' : 'выключено'}\n\n${
        MESSAGES['ru'].SETTINGS
      }`,
    ALREADY_REGISTERED:
      'Ты уже зарегистрирован(а)!\n\nДля вызова меню напиши /menu',
    ATTACHED_MESSAGE_FOR_MAILING_NOT_FOUND:
      'Нет прикреплённого сообщения или текста для рассылки',
    CANCEL_SEARCH: 'Поиск отменён\n\nДля вызова меню напиши /menu',
    DAYS_WEEK: [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ],
    DAYS_WEEK_SHORT: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    DETAIL_WEEK_SWITCHED: (flag: boolean) =>
      `Подробная неделя ${flag ? 'включена' : 'выключена'}\n\n${
        MESSAGES['ru'].SETTINGS
      }`,
    ENTER_GROUP: 'Напиши свою группу (можно не полностью)',
    ENTER_LECTURER: 'Напиши ФИО преподавателя (можно не полностью)',
    ERROR_RETRY: 'Произошла ошибка. Ты можешь попробовать ещё раз',
    FETCHING: 'Получаю данные...',
    GREETING: 'Привет!',
    GROUP_NOT_SELECTED: 'Группа не выбрана. Пройти регистрацию: /start',
    GROUP_SELECTED: (group_name: string) =>
      `Выбрана группа <b>${group_name}</b>\n\nДля вызова меню напиши /menu`,
    HELP_INFO:
      'Бот получает расписание напрямую с сайта университета.\n\n' +
      'Основное управление ботом происходит при помощи кнопок в сообщениях бота.\n' +
      '\nОднако это не всегда удобно. На этот случай существует способ запросить у бота расписание, написав ему сообщение, к примеру, "расписание на завтра" или "расписание с понедельника по пятницу".\n' +
      '\nP.s. для более продивнутых, бот понимает такие форматы дат, как:\n' +
      '10 сентября - 12 ноября 2023\n' +
      '24го октября\n' +
      'через месяц\n' +
      'в следующий четверг\n' +
      '06.09.2023\n',
    LECTURER_SELECTED: (lecturer_name: string) =>
      `Выбран преподаватель <b>${lecturer_name}</b>`,
    MAILING_UNSUBSCRIBE_INFO: 'Отписаться от рассылкии можно в настройках бота',
    MANY_GROUPS_FOUND: 'Найдено слишком много групп. Напиши поточнее',
    MANY_LECTURERS_FOUND:
      'Найдено слишком много преподавателей. Напиши поточнее',
    MENU: 'Меню',
    NOT_REGISTERED: 'Вы не зарегистрированы',
    NOT_REGISTERED_FOR_SETTINGS:
      'Чтобы что-то менять, нужно сначала это что-то создать. Пройти регистрацию: /start',
    NO_ANSWER_RETRY:
      'Сайт не ответил на твой запрос :(\n\nТы можешь попробовать ещё раз',
    NO_GROUPS_FOUND:
      'Группа с таким названием не найдена. Ты можешь попробовать ещё раз',
    NO_LECTURER_FOUND:
      'Преподователь с таким ФИО не найден. Ты можешь попробовать ещё раз',
    PROCESSING: 'Обрабатываю запрос...',
    PROFILE_REMOVED: 'Профиль удален',
    SEARCHING: 'Идёт поиск...',
    SELECT_GROUP: 'Выбери группу:',
    SELECT_LECTURER: 'Выбери преподавателя:',
    SETTINGS:
      '<b>Настройки</b>\n\n&#8226; Сменить группу - показывать расписание для другой группы\n&#8226; Подробная неделя - показывать больше информации в расписании на неделю. <i>(напр. время, преподаватели)</i>',
    UNKNOWN_DATES_SCHEDULE:
      'Я не могу распознать дни, которые ты хочешь увидеть.\n\n' +
      'Я понимаю такие сообщения, как `расписание на завтра`, `расписание через неделю`, `расписание на среду и пятницу` и т.п.\n' +
      'Также ты можешь написать дату или отрезок времени (например, `расписание на 1 сернтября - 9 сентября`)',
  },
};
