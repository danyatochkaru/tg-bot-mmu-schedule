import { Action, Ctx, Hears, Update } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { editMessage } from '../utils/editMessage';
import { MESSAGES } from '../app.constants';
import { floorMapsMenuButtons } from './floor-maps.buttons';

@Update()
export class FloorMapsUpdate {
  private logger = new Logger(FloorMapsUpdate.name);

  @Hears(/^карта$/i)
  @Action('floor-maps')
  async getFloorMapsMenu(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await editMessage(ctx, MESSAGES['ru'].FLOOR_MENU, {
        reply_markup: floorMapsMenuButtons().reply_markup,
      });
    } else {
      await ctx
        .reply(MESSAGES['ru'].FLOOR_MENU, {
          reply_markup: floorMapsMenuButtons().reply_markup,
        })
        .catch((err) => this.logger.error(JSON.stringify(err, undefined, 2)));
    }
  }

  @Hears(/^(\d\s+)?этаж(\s+\d)?$/i)
  @Action(/^floor-[0-9]$/i)
  async getFloorMap(@Ctx() ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      await ctx.replyWithPhoto(
        {
          url: `http://192.168.0.107:5050/bot-api/file/${ctx.callbackQuery.data}.jpg`,
        },
        { reply_markup: floorMapsMenuButtons().reply_markup },
      );
    } else if ('text' in ctx.message) {
      const floor = ctx.message.text.match(/\d/);

      if (!floor) {
        return;
      }

      await ctx.replyWithPhoto(
        {
          url: `http://192.168.0.107:5050/bot-api/file/floor-${floor[0]}.jpg`,
        },
        { reply_markup: floorMapsMenuButtons().reply_markup },
      );
    }
  }

  @Hears(/^все этажи$/i)
  async getAllFloorMaps(@Ctx() ctx: Context) {
    await ctx.replyWithMediaGroup(
      new Array(6).fill(null).map((_, index) => ({
        type: 'photo',
        caption: `${index + 1} этаж`,
        media: {
          url: `http://192.168.0.107:5050/bot-api/file/floor-${index + 1}.jpg`,
        },
      })),
    );
  }
}
