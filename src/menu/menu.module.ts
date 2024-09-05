import { Module } from '@nestjs/common';
import { MenuUpdate } from './menu.update';
import { UsersModule } from '../users/users.module';
import { FaqModule } from '../faq/faq.module';

@Module({ imports: [UsersModule, FaqModule], providers: [MenuUpdate] })
export class MenuModule {}
