import { Module } from '@nestjs/common';
import { GreeterWizard } from './greeter.wizard';
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
  providers: [GreeterWizard],
})
export class GreeterModule {}
