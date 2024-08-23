export class InfoUsersObject {
  date?: Date;
  dates?: [Date, Date];
  total_count: number;
  details?: Array<{
    group_id?: number;
    count: number;
    date?: Date;
    scale?: 'day' | 'week' | 'month';
  }>;
}
