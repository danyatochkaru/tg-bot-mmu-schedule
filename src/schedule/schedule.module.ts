import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUpdate } from './schedule.update';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        baseURL: `https://${config.get('AUTH')}@${config.get('URL')}`,
        timeout: 1000 * 20,
      }),
    }),
  ],
  providers: [ScheduleService, ScheduleUpdate],
})
export class ScheduleModule {}
