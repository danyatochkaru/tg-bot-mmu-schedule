import { Module } from '@nestjs/common';
import { GreeterWizard } from './greeter.wizard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [GreeterWizard],
})
export class GreeterModule {}
