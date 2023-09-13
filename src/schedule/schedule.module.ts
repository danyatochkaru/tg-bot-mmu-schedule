import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUpdate } from './schedule.update';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ScheduleService, ScheduleUpdate],
})
export class ScheduleModule {}
