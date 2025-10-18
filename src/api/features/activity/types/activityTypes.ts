export type ActivityKind =
  | "event.created" | "event.updated" | "event.commented"
  | "attendance.upserted"
  | "member.created" | "member.updated";

export type Id = string;

export interface ActivityTarget {
  type?: string;
  id?: string;
  name?: string;
}

export interface ActivityItem {
  _id: Id;
  kind: ActivityKind;
  verb: string;                 // human readable, e.g., "created an event"
  actorId?: Id;
  actorName?: string;
  target?: ActivityTarget;
  meta?: Record<string, any>;
  churchId?: Id;
  districtId?: Id;
  nationalId?: Id;
  createdAt: string;            // ISO
}

export interface ActivityListResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  pages: number;
}

export type ActivityListParams = {
  page?: number;
  limit?: number;
};
