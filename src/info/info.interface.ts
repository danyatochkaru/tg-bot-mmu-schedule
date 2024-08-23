export class InfoUsersObject {
  total_count: number;
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
