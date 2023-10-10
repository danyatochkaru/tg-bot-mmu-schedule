import { Context } from 'telegraf';
import { ExtraEditMessageText } from 'telegraf/src/telegram-types';
import { Logger } from '@nestjs/common';

function checkMessage(message: { message_id: number }) {
  if (!message) {
    throw new Error('No message provided');
  }
}

export async function editMessage(
  ctx: Context,
  text: string,
  options?: ExtraEditMessageText,
  message?: { message_id: number },
) {
  const logger = new Logger('editMessage');

  try {
    if (ctx && !ctx.callbackQuery) {
      checkMessage(message);
      return await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        text,
        options,
      );
    }

    return await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      text,
      options,
    );
  } catch (err: any) {
    logger.error(`Failed to edit message for ${ctx.chat.id}`);
    logger.error(err);
    return false;
  }
}
