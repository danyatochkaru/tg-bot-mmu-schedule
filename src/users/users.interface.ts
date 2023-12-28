import { IsNumberString } from 'class-validator';

export class UsersCountByGroupsQuery {
  @IsNumberString({ locale: 'ru-RU', no_symbols: true }, { each: true })
  groupsList: number[];
}
