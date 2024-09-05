import {
  Body,
  Controller,
  Delete,
  Get,
  ParseEnumPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { DataEntity, DataLanguages } from '../data/data.entity';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('faq')
export class FaqController {
  constructor(private faqService: FaqService) {}

  @Get()
  getFaq(
    @Query('lang', new ParseEnumPipe(DataLanguages))
    lang: DataEntity['language'],
  ) {
    return this.faqService.getFaq([lang]);
  }

  @Post()
  setFaq(@Body() data: Pick<DataEntity, 'value' | 'language'>) {
    return this.faqService.setFaq(data.value, data.language);
  }

  @Delete()
  removeFaq(
    @Query('lang', new ParseEnumPipe(DataLanguages))
    lang: DataEntity['language'],
  ) {
    return this.faqService.removeFaq(lang);
  }
}
