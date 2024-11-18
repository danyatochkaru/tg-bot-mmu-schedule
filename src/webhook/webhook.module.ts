import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEntity } from './entities/webhook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEntity])],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
