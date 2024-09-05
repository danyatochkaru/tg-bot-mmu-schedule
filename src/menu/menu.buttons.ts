import { Markup } from 'telegraf';

export const theMenu = ({ link, faq }: { link: string; faq: boolean }) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('На день', `day-current`),
      Markup.button.callback('На неделю', `week-current`),
    ],
    [Markup.button.callback('Преподаватель', 'lecturer')],
    [Markup.button.callback('Карта ГК', 'floor-maps')],
    [
      Markup.button.url('ЛК', `https://elearn.mmu.ru`),
      Markup.button.switchToChat(
        `Поделиться`,
        `\n\nЯ пользуюсь ботом с расписанием занятий ММУ и хочу поделиться им с вами! Переходите по ссылке ниже и вы сразу сможете получать расписание нашей группы:\n${link}`,
      ),
    ],
    [Markup.button.callback('FAQ', 'faq', !faq)],
    [
      Markup.button.callback('Настройки', `settings`),
      Markup.button.url('Автор', 'https://danyatochka.ru'),
    ],
  ]);
