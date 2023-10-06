import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { MESSAGES, SELECT_LECTURER } from '../app.constants';
import { WizardContext } from 'telegraf/typings/scenes';
import { editMessage } from '../utils/editMessage';
import { ApiService } from '../api/api.service';
import {
  lecturerController,
  requestLecturerSchedule,
  searchingLecturerList,
} from './lecturer.buttons';
import { LecturerService } from './lecturer.service';

@Wizard(SELECT_LECTURER)
export class LecturerWizard {
  constructor(
    private readonly lecturerService: LecturerService,
    private readonly apiService: ApiService,
  ) {}

  @WizardStep(1)
  async onStart(@Ctx() ctx: WizardContext) {
    ctx.wizard.next();
    await ctx.reply(MESSAGES['ru'].ENTER_LECTURER, {
      reply_markup: searchingLecturerList([]).reply_markup,
    });
  }

  @Action('cancel')
  @WizardStep(2)
  async backToMenu(@Ctx() ctx: WizardContext) {
    await ctx.scene.leave();
    await editMessage(ctx, MESSAGES['ru'].CANCEL_SEARCH);
  }

  @On('text')
  @WizardStep(2)
  async onMessage(@Ctx() ctx: WizardContext, @Message() msg: { text: string }) {
    const message = await ctx.reply(MESSAGES['ru'].SEARCHING);
    const lecturers = await this.apiService.search({
      payload: { term: msg.text, type: 'lecturer' },
    });

    if (lecturers instanceof Error) {
      await editMessage(ctx, MESSAGES['ru'].ERROR_RETRY, {}, message);
      return;
    }

    if (!lecturers.length) {
      await editMessage(ctx, MESSAGES['ru'].NO_LECTURER_FOUND, {}, message);
      return;
    }

    if (lecturers.length > 8) {
      await editMessage(ctx, MESSAGES['ru'].MANY_LECTURERS_FOUND, {}, message);
      return;
    }

    (ctx.wizard.state as any).lecturers = lecturers;
    ctx.wizard.next();
    await editMessage(
      ctx,
      MESSAGES['ru'].SELECT_LECTURER,
      {
        reply_markup: searchingLecturerList(lecturers).reply_markup,
      },
      message,
    );
  }

  @Action('cancel')
  @WizardStep(3)
  async chancelSelectLecturer(@Ctx() ctx: WizardContext) {
    ctx.wizard.back();
    await editMessage(ctx, MESSAGES['ru'].ENTER_LECTURER);
  }

  @Action(/lecturer-search-/i)
  @WizardStep(3)
  async onGroupSelect(@Ctx() ctx: WizardContext) {
    const lecturer_id = (ctx.callbackQuery as { data: string }).data.replace(
      'lecturer-search-',
      '',
    );

    const selected_lecturer = (ctx.wizard.state as any).lecturers.find(
      (l: any) => String(l.id) === String(lecturer_id),
    );

    await ctx.scene.leave();
    await editMessage(
      ctx,
      MESSAGES['ru'].LECTURER_SELECTED(selected_lecturer.label),
      {
        reply_markup: requestLecturerSchedule(parseInt(lecturer_id), new Date())
          .reply_markup,
        parse_mode: 'HTML',
      },
    );

    const lessons = await this.lecturerService.getLecturerSchedule(
      parseInt(lecturer_id),
      new Date(),
    );

    await ctx.replyWithHTML(
      this.lecturerService.prepareTextMessageForLecturer(lessons),
      {
        reply_markup: lecturerController(parseInt(lecturer_id), new Date())
          .reply_markup,
      },
    );
  }
}
