import { Context } from 'telegraf';
import { ExtraEditMessageText } from 'telegraf/src/telegram-types';

export function editMessage(
  ctx: Context,
  text: string,
  options?: ExtraEditMessageText,
  message?: { message_id: number },
) {
  try {
    if (ctx && !ctx.callbackQuery) {
      if (!message) {
        return false;
      }
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        text,
        options,
      );
    }

    return ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      text,
      options,
    );
  } catch (err: any) {
    console.log(`Failed to edit message for ${ctx.chat.id}`, err);
  }
}
