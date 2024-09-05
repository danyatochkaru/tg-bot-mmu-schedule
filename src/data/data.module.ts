import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntity } from './data.entity';
import { DataService } from './data.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataEntity])],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
