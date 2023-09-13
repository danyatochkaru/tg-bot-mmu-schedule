import { Module } from '@nestjs/common';
import { MenuUpdate } from './menu.update';

@Module({ providers: [MenuUpdate] })
export class MenuModule {}
