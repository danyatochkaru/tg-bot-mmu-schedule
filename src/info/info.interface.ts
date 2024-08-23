export class InfoUsersObject {
  date?: Date;
  dates?: [Date, Date];
  total_count: number;
  details?: Array<{
    groups: Array<{
      group_id: number;
      group_name?: string;
      inactive_count?: number;
      count: number;
    }>;
    date: Date;
    scale: 'day' | 'week' | 'month';
  }>;
}
