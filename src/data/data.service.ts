import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DataEntity } from './data.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(DataEntity)
    private dataRepository: Repository<DataEntity>,
  ) {}

  getData(key: DataEntity['key']) {
    return this.dataRepository.findBy({ key });
  }

  async setData(data: DataEntity) {
    let _data = await this.dataRepository.findOneBy({
      key: data.key,
      language: data.language,
    });

    if (!_data) {
      _data = new DataEntity();
      _data.key = data.key;
      _data.language = data.language;
    }

    _data.value = data.value;

    await this.dataRepository.save(_data);

    return _data;
  }

  async removeData(data: Pick<DataEntity, 'key' | 'language'>) {
    const _data = await this.dataRepository.findOneBy(data);

    if (_data) {
      await this.dataRepository.delete(_data);
    }

    return;
  }
}
