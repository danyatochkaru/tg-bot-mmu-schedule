import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as path from 'node:path';
import * as process from 'node:process';

@Controller('file')
export class FileController {
  @Get(':filename')
  async getFile(@Param('filename') filename: string) {
    return new StreamableFile(
      createReadStream(path.join(process.cwd(), `static/${filename}`)),
    );
  }
}
