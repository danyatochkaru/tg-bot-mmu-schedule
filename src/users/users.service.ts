import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(
    payload: Omit<UserEntity, 'id' | 'updated_at' | 'created_at'>,
  ) {
    const existingUser = await this.getInfo(payload.uid);
    if (existingUser) {
      throw new Error('Пользователь уже зарегистирован');
    }
    const new_user = this.userRepository.create(payload);
    return await this.userRepository.save(new_user);
  }

  async editInfo(
    uid: number | string,
    payload: Omit<Partial<UserEntity>, 'id' | 'updated_at' | 'created_at'>,
  ) {
    const user = await this.getInfo(uid);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    await this.userRepository.update({ uid: String(uid) }, payload);
    return this.getInfo(uid);
  }

  getInfo(uid: number | string) {
    return this.userRepository.findOneBy({ uid: String(uid) });
  }

  async remove(uid: number | string) {
    return this.userRepository.delete({ uid: String(uid) });
  }
}
