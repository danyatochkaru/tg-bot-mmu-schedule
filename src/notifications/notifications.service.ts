import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { CanceledError } from 'axios';
import * as telegramifyMarkdown from 'telegramify-markdown';
import { WebhookService } from '../webhook/webhook.service';
import { HttpService } from '@nestjs/axios';
import { AppEvent } from '../webhook/entities/webhook.entity';

@Injectable()
export class NotificationsService {
  requestsPerCycle: number;
  isRunning: boolean;
  maxRetryCount: number;
  progress: { current: number; total: number; rejected: number };
  lastResults: {
    allOk: boolean;
    rejected: {
      response: any;
      chat_id: number;
    }[];
    totalUsers: number;
    studentsCountByGroup: Record<string, number>;
  }[];
  abortController: AbortController | null;
  private logger = new Logger(NotificationsService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly usersService: UsersService,
    private readonly webhookService: WebhookService,
    private readonly httpService: HttpService,
  ) {
    this.requestsPerCycle = 5;
    this.isRunning = false;
    this.maxRetryCount = 5;
    this.progress = { current: 0, total: 0, rejected: 0 };
    this.lastResults = [];
    this.abortController = null;
  }

  async abortSending() {
    if (this.abortController) {
      this.logger.log('Aborting sending notification');
      this.sendWH(AppEvent.NOTIFICATION_CANCELLED, this.progress).then(() => {
        this.logger.log(`WH [${AppEvent.NOTIFICATION_CANCELLED}] sent`);
      });
      this.abortController.abort();
      return 'ok';
    } else {
      this.logger.log('Abort sending notification canceled');
      throw new BadRequestException();
    }
  }

  async sendNotifies(
    groupList: number[],
    text: string,
    options?: {
      doLinkPreview?: boolean;
    },
  ) {
    if (this.isRunning) {
      throw new CanceledError('Already is running. Try later...');
    }
    this.isRunning = true;
    this.abortController = new AbortController();

    const users = await this.usersService.findByGroupList(groupList);
    const list = users
      .filter((u) => !u.is_inactive)
      .map((u) => parseInt(u.uid));

    this.progress.total = list.length;

    type Rejected = Omit<PromiseRejectedResult, 'reason'> & {
      reason: {
        response: {
          ok: boolean;
          error_code: number;
          description: string;
          parameters: any;
        };
        on: {
          method: string;
          payload: {
            chat_id: number;
            parse_mode: string;
            text: string;
          };
        };
      };
    };

    const rejected: Rejected[] = [];

    const preparedText = telegramifyMarkdown(text);

    this.sendWH(AppEvent.NOTIFICATION_STARTED, this.progress).then(() => {
      this.logger.log(`WH [${AppEvent.NOTIFICATION_STARTED}] sent`);
    });

    const startTime = Date.now();
    console.time(`Time has passed for ${list.length}`);
    const sendingResult = await this.sendMessageByList(list, preparedText, {
      doLinkPreview: options.doLinkPreview ?? true,
    });

    rejected.push(...sendingResult.rejected);

    if (sendingResult.status !== 0) {
      this.logger.error(
        `Error occurred during sending notifications. Reason: ${sendingResult.message}`,
      );
      throw new Error('Error occurred during sending notifications');
    }

    try {
      if (rejected.length) {
        let retry_count = 0;
        while (
          rejected.some(
            (r) =>
              !!r.reason.response &&
              (r.reason.response.error_code === 429 ||
                r.reason.response.error_code === 403),
          ) &&
          retry_count < this.maxRetryCount
        ) {
          ++retry_count;
          const toRetry = rejected
            .filter(
              (r) =>
                !!r.reason.response &&
                (r.reason.response.error_code === 429 ||
                  r.reason.response.error_code === 403),
            )
            .map((r) => r.reason.on.payload.chat_id);

          rejected.length = 0;
          const retryResult = await this.sendMessageByList(
            toRetry,
            preparedText,
            {
              doLinkPreview: options.doLinkPreview ?? true,
            },
          );
          rejected.push(...retryResult.rejected);

          if (sendingResult.status !== 0) {
            this.logger.error(
              `Error occurred during sending notifications. Reason: ${retryResult.message}`,
            );
            return new Error('Error occurred during sending notifications');
          }
        }
      }
      console.timeEnd(`Time has passed for ${list.length}`);
      this.logger.log(
        `Time has passed for ${list.length}: ${Date.now() - startTime}ms`,
      );

      const _bannedByUser = rejected.filter(
        (r) => r.reason.response.error_code === 403,
      );

      for (const rej of _bannedByUser) {
        this.usersService
          .editInfo(rej.reason.on.payload.chat_id, {
            is_inactive: true,
            inactive_reason: rej.reason.response.description,
          })
          .then(() => {
            /* TEMP:
          console.log({
            chat_id: rej.reason.on.payload.chat_id,
            is_inactive: true,
            inactive_reason: rej.reason.response.description,
          });
          */
          });
      }
    } catch (e: any) {
      this.logger.error(
        `Error counting inactive users: ${JSON.stringify(e, undefined, 2)}`,
      );
    }

    this.progress = { current: 0, total: 0, rejected: 0 };
    this.isRunning = false;
    this.abortController = null;
    this.lastResults.push({
      allOk: rejected.length === 0,
      rejected: rejected.map((i) => ({
        response: i.reason.response,
        chat_id: i.reason.on.payload.chat_id,
      })),
      totalUsers: users.length,
      studentsCountByGroup: (
        await this.usersService.getCountByGroups(groupList, users)
      ).groups,
    });
    if (this.lastResults.length > 10) this.lastResults.shift();
    const result = this.lastResults.slice(-1);
    this.sendWH(AppEvent.NOTIFICATION_COMPLETED, result).then(() => {
      this.logger.log(`WH [${AppEvent.NOTIFICATION_COMPLETED}] sent`);
    });
    return result;
  }

  async sendMessageByList(
    list: number[],
    text: string,
    options?: {
      requestsPerCycle?: number;
      doLinkPreview?: boolean;
      signal?: AbortSignal;
    },
  ) {
    const rejected: (
      | {
          response: {
            ok: boolean;
            error_code: number;
            description: string;
          };
          chat_id: string;
        }
      | any
    )[] = [];
    const requestsPerCycle = options?.requestsPerCycle ?? this.requestsPerCycle;

    for (let i = 0; i < list.length; i += requestsPerCycle) {
      if (options?.signal?.aborted) {
        this.logger.log(
          `Aborted by signal. Reason: ${typeof options.signal.reason === 'string' ? options.signal.reason : JSON.stringify(options.signal.reason)}`,
        );
        return { rejected, message: 'Aborted by signal', status: 1 };
      }
      const preparedList = list.slice(i, i + requestsPerCycle);

      const startTime = Date.now();

      await Promise.allSettled(
        preparedList.map((item) => {
          return this.bot.telegram.sendMessage(item, text, {
            parse_mode: 'MarkdownV2',
            link_preview_options: {
              is_disabled: !options.doLinkPreview,
            },
          });
        }),
      ).then((results) =>
        results.forEach((r) => r.status === 'rejected' && rejected.push(r)),
      );
      const timeLeft = Date.now() - startTime;
      if (i + requestsPerCycle < list.length)
        await this.sleep(timeLeft > 1000 ? 0 : 1000);

      this.progress.current = i;
      this.progress.rejected = rejected.length;
    }

    return { rejected, message: 'ok', status: 0 };
  }

  async sleep(ms: number): Promise<void> {
    // console.log(`asleep for ${ms} ms`);
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  async sendWH(event: AppEvent, payload: any) {
    const wh = await this.webhookService.findByEventGroup('notification');

    const clients = wh.filter((i) => i.event === event && i.isEnabled);

    for (const client of clients) {
      try {
        this.httpService.post(client.url, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        this.logger.error(
          `Error sending webhook to ${client.url}`,
          JSON.stringify(e),
        );
        console.error(`Error sending webhook to ${client.url}:`, e);
      }
    }
  }
}
