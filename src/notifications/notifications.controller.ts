import {
  Body,
  Controller,
  Get,
  MethodNotAllowedException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NewNotification } from './notifications.interface';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('status')
  getNotificationsInfo() {
    return {
      isRunning: this.notificationsService.isRunning,
      args: this.notificationsService.args,
      progress: this.notificationsService.progress,
      history: this.notificationsService.lastResults,
    };
  }

  @Post()
  sendNotifications(@Body() newNotification: NewNotification) {
    if (this.notificationsService.isRunning) {
      throw new MethodNotAllowedException('Already is running. Try later...');
    }

    this.notificationsService.sendNotifies(
      newNotification.id,
      newNotification.groups,
      newNotification.text,
      {
        doLinkPreview: newNotification.doLinkPreview,
      },
    );

    return 'ok';
  }

  @Post('/abort')
  abortSending() {
    return this.notificationsService.abortSending();
  }
}
