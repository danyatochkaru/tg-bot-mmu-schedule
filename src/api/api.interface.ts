export interface Api {
  Search: {
    payload: SearchPayload;
  };
  Schedule: {
    entity_type: 'group' | 'lecturer';
    entity_id: number;
    payload: SchedulePayload;
  };
}

type SearchPayload = {
  term: string;
  type: 'group' | 'lecturer';
};

type SchedulePayload = {
  start: Date;
  finish: Date;
};

export type SearchResponseData = {
  description: string;
  id: number;
  label: string;
  type: string;
};
