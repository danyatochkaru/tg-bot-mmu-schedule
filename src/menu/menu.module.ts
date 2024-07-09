import { Module } from '@nestjs/common';
import { MenuUpdate } from './menu.update';
import { UsersModule } from '../users/users.module';

@Module({ imports: [UsersModule], providers: [MenuUpdate] })
export class MenuModule {}
