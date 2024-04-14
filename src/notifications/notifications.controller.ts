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
      progress: this.notificationsService.progress,
      history: this.notificationsService.lastResults,
    };
  }

  @Post()
  sendNotifications(@Body() newNotification: NewNotification) {
    if (this.notificationsService.isRunning) {
      throw new MethodNotAllowedException('Already is running. Try later...');
    }

    console.log('newNotification.doLinkPreview', newNotification.doLinkPreview);

    this.notificationsService.sendNotifies(
      newNotification.groups,
      newNotification.text,
      {
        doLinkPreview: newNotification.doLinkPreview,
      },
    );

    return 'ok';
  }
}
