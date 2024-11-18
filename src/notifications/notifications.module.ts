import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UsersModule } from '../users/users.module';
import { WebhookModule } from '../webhook/webhook.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [UsersModule, WebhookModule, HttpModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
