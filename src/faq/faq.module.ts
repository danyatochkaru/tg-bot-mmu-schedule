import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { DataModule } from '../data/data.module';
import { FaqController } from './faq.controller';
import { UsersModule } from '../users/users.module';
import { FaqUpdate } from './faq.update';

@Module({
  imports: [DataModule, UsersModule],
  controllers: [FaqController],
  providers: [FaqService, FaqUpdate],
  exports: [FaqService],
})
export class FaqModule {}
