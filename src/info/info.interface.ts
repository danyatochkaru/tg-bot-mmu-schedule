export class InfoUsersObject {
  total_count: number;
  total_inactive?: number;
  details?: Array<{
    groups: Array<{
      group_id: number;
      group_name?: string;
      inactive_count?: number;
      count: number;
    }>;
    date: Date;
  }>;
}
