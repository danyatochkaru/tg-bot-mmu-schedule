import { Module } from '@nestjs/common';
import { GreeterWizard } from './greeter.wizard';
import { UsersModule } from '../users/users.module';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [UsersModule, ApiModule],
  providers: [GreeterWizard],
})
export class GreeterModule {}
