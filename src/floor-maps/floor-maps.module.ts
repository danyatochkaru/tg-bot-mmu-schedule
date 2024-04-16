import { Module } from '@nestjs/common';
import { FloorMapsUpdate } from './floor-maps.update';

@Module({
  providers: [FloorMapsUpdate],
})
export class FloorMapsModule {}
