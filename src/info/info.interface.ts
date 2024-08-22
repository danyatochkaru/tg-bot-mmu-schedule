export class InfoUsersObject {
  total_count: number;
  details?: Array<{
    group_id: number;
    count: number;
  }>;
}
