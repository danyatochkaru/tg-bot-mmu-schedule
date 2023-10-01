import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export const fetcher = (config: ConfigService) =>
  axios.create({
    baseURL: `https://${config.get('AUTH')}@${config.get('URL')}`,
    // timeout: 1000 * 20,
  });
