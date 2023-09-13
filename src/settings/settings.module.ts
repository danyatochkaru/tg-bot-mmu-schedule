import { Module } from '@nestjs/common';
import { SettingsUpdate } from './settings.update';
import { UsersModule } from '../users/users.module';

@Module({ imports: [UsersModule], providers: [SettingsUpdate] })
export class SettingsModule {}
