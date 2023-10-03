import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUpdate } from './schedule.update';
import { UsersModule } from '../users/users.module';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [UsersModule, ApiModule],
  providers: [ScheduleService, ScheduleUpdate],
})
export class ScheduleModule {}
