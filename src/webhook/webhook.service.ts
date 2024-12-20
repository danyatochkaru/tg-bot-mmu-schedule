import { Injectable, Logger } from '@nestjs/common';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { AppEvent, WebhookEntity } from './entities/webhook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WebhookService {
  private logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
  ) {}

  async create(createWebhookDto: CreateWebhookDto) {
    const wh = await this.webhookRepository.findBy({
      event: createWebhookDto.event,
      url: createWebhookDto.url,
    });

    if (wh.length) {
      this.logger.error(
        `Webhook with event ${createWebhookDto.event} and url ${createWebhookDto.url} already exists`,
      );
      return null;
    }

    const new_webhook = this.webhookRepository.create(createWebhookDto);

    return this.webhookRepository.save(new_webhook);
  }

  findAll(event?: AppEvent) {
    return this.webhookRepository.find({
      where: event ? { event } : undefined,
    });
  }

  findByEventGroup(eventGroup: 'notification'): Promise<WebhookEntity[]> {
    return this.webhookRepository.query(
      `SELECT * FROM "webhook_entity" WHERE "webhook_entity"."event"::text LIKE '${eventGroup}/%'`,
    );
  }

  findOne(id: string) {
    return this.webhookRepository.findOneBy({ id });
  }

  async update(id: string, updateWebhookDto: UpdateWebhookDto) {
    const wh = await this.findOne(id);

    if (!wh) {
      this.logger.error(`Webhook with id ${id} not found`);
      return null;
    }

    await this.webhookRepository.update(id, updateWebhookDto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.webhookRepository.delete({ id });
    return 'ok';
  }
}
