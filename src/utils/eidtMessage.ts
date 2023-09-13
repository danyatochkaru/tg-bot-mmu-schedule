import { Context } from 'telegraf';
import { ExtraEditMessageText } from 'telegraf/src/telegram-types';

export function editMessage(
  ctx: Context,
  text: string,
  options?: ExtraEditMessageText,
) {
  if (!('callbackQuery' in ctx)) return false;

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.callbackQuery.message.message_id,
    undefined,
    text,
    options,
  );
}
