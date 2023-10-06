import { Module } from '@nestjs/common';
import { LecturerWizard } from './lecturer.wizard';
import { ApiModule } from '../api/api.module';
import { LecturerUpdate } from './lecturer.update';
import { LecturerService } from './lecturer.service';

@Module({
  imports: [ApiModule],
  providers: [LecturerWizard, LecturerUpdate, LecturerService],
})
export class LecturerModule {}
