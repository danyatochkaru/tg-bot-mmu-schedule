import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { DataEntity } from '../data/data.entity';

@Injectable()
export class FaqService {
  constructor(private dataService: DataService) {}

  async getFaq(languages?: DataEntity['language'][]) {
    let faqItems = await this.dataService.getData('faq');

    if (languages && languages.length) {
      faqItems = faqItems.filter((item) => languages.includes(item.language));
    }

    return faqItems;
  }

  async setFaq(value: DataEntity['value'], language?: DataEntity['language']) {
    if (value.trim() === '') {
      return this.removeFaq(language);
    }

    const data = {
      key: 'faq',
      value,
      language: language || 'ru',
    };

    return this.dataService.setData(data);
  }

  async removeFaq(language?: DataEntity['language']) {
    return this.dataService.removeData({
      key: 'faq',
      language: language || 'ru',
    });
  }
}
