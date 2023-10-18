import { Injectable, Logger } from '@nestjs/common';
import { Api, SearchResponseData } from './api.interface';
import { HttpService } from '@nestjs/axios';
import { formatDate } from '../utils/formatDate';

@Injectable()
export class ApiService {
  private logger = new Logger(ApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async search(data: Api['Search']) {
    try {
      const res = await this.httpService.axiosRef.get<SearchResponseData[]>(
        `search?term=${encodeURIComponent(data.payload.term)}&type=${
          data.payload.type
        }`,
      );
      return res.data;
    } catch (err) {
      this.logger.error(err ?? 'Unknown error');
      this.logger.error(JSON.stringify(data, undefined, 2));
      return new Error('Request error');
    }
  }

  async schedule(data: Api['Schedule']) {
    try {
      const res = await this.httpService.axiosRef.get<any[]>(
        `schedule/${data.entity_type}/${String(
          data.entity_id,
        )}/?start=${formatDate(data.payload.start)}&finish=${formatDate(
          data.payload.finish,
        )}`,
      );
      return res.data;
    } catch (err) {
      this.logger.error(err ?? 'Unknown error');
      this.logger.error(JSON.stringify(data, undefined, 2));
      return new Error('Request error');
    }
  }
}
