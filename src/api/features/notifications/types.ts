// src/api/features/notifications/types.ts
export type NotifScope = "user" | "church" | "district" | "national";
export type NotifKind =
  | "event.created" | "event.updated" | "event.commented"
  | "attendance.upserted"
  | "member.created" | "member.updated"
  | "system";

export interface NotificationDoc {
  _id: string;
  kind: NotifKind;
  title: string;
  message?: string;
  link?: string;
  actorId?: string;
  actorName?: string;
  scope: NotifScope;
  scopeRef?: string;
  recipients?: string[];
  readBy: string[];
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
