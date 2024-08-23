import { UserEntity } from '../users/user.entity';

export class InfoUsersObject {
  date?: Date;
  dates?: [Date, Date];
  total_count: number;
  details?: Array<{
    groups: Array<
      Pick<
        UserEntity,
        | 'group_name'
        | 'is_inactive'
        | 'inactive_reason'
        | 'register_source'
        | 'created_at'
      > & {
        group_id: number;
        count: number;
      }
    >;
    date: Date;
    scale: 'day' | 'week' | 'month';
  }>;
}
