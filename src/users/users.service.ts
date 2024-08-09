import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

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

  getListForMailing(user_id: string) {
    const ADMIN_IDS = process.env.ADMIN_IDS;

    if (!ADMIN_IDS) {
      throw new Error('Список админов пуст');
    }

    if (ADMIN_IDS.split(',').includes(user_id))
      return this.userRepository.find({ where: { allow_mailing: true } });
    else {
      throw new Error('Недостаточно прав');
    }
  }

  async remove(uid: number | string) {
    return this.userRepository.delete({ uid: String(uid) });
  }

  async checkUserDataUpdated(user: {
    username?: string;
    first_name?: string;
    last_name?: string;
    id: number;
  }) {
    const user_from_db = await this.getInfo(user.id);

    if (
      ('username' in user && user_from_db.username !== user.username) ||
      ('first_name' in user && user_from_db.first_name !== user.first_name) ||
      ('last_name' in user && user_from_db.last_name !== user.last_name)
    ) {
      this.editInfo(user.id, {
        last_name: user.last_name,
        first_name: user.first_name,
        username: user.username,
      })
        .then((r) => this.logger.log(`user info ${r.uid}: updated`))
        .catch((err) => {
          this.logger.error(`user info ${user.id}: update errored`);
          this.logger.error(JSON.stringify(err, undefined, 2));
        });
    }
  }

  findByGroupList(groupList: number[]) {
    return this.userRepository.find({
      where: {
        group_id: In(groupList),
      },
    });
  }

  async getCountByGroups(groupList: number[], users?: UserEntity[]) {
    const usersFromDB = users ?? (await this.findByGroupList(groupList));

    const studentsCountByGroup: Record<number, number> = {};
    for (const groupId of groupList) {
      studentsCountByGroup[groupId] = usersFromDB.filter(
        (u) => u.group_id === Number(groupId),
      ).length;
    }

    const inactive = usersFromDB.reduce(
      (acc, cur) => acc + (cur.is_inactive ? 1 : 0),
      0,
    );

    return {
      groups: studentsCountByGroup,
      inactive,
      total: usersFromDB.length,
    };
  }
}
