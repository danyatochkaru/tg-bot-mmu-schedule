import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        baseURL: `https://${config.get('AUTH')}@${config.get('URL')}`,
        timeout: 1000 * 20,
      }),
    }),
  ],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
