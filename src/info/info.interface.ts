export class InfoUsersObject {
  date?: Date;
  total_count: number;
  details?: Array<{
    group_id: number;
    count: number;
  }>;
}
