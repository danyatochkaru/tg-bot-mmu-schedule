import { Module } from '@nestjs/common';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppUpdate } from './app.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SettingsModule } from './settings/settings.module';
import { GreeterModule } from './greeter/greeter.module';
import { ApiModule } from './api/api.module';

const sessions = new LocalSession();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TOKEN'),
        middlewares: [sessions.middleware()],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('TYPEORM_HOST'),
        username: configService.get('TYPEORM_USER'),
        password: configService.get('TYPEORM_PASS'),
        database: configService.get('TYPEORM_DB'),
        port: configService.get('TYPEORM_PORT'),
        entities: [__dirname + 'dist/**/*.entity.{t,j}.s'],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    ScheduleModule,
    MenuModule,
    SettingsModule,
    GreeterModule,
    UsersModule,
    ApiModule,
  ],
  providers: [AppUpdate],
})
export class AppModule {}
