export type ServiceType =
  | "Sunday"
  | "Midweek"
  | "PrayerMeeting"
  | "Vigil"
  | "Conference"
  | "Special"
  | "Other";

export interface Attendance {
  _id: string;
  churchId: string;
  serviceDate: string;    // ISO date
  serviceType: ServiceType;
  men: number;
  women: number;
  children: number;
  firstTimers: number;
  newConverts: number;
  holyGhostBaptisms: number;
  online?: number;
  ushers?: number;
  choir?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  // derived on server (virtual) – we’ll also compute safely on client
  total?: number;
}

export type AttendanceCreate = Omit<Attendance, "_id" | "createdAt" | "updatedAt" | "isDeleted">;

export type AttendanceUpsertKey = {
  churchId: string;
  serviceDate: string;    // yyyy-mm-dd or ISO
  serviceType: ServiceType;
};

export type AttendanceUpsertPayload = Partial<AttendanceCreate> & AttendanceUpsertKey;

export interface AttendanceListResponse {
  items: Attendance[];
  total: number;
  page: number;
  pages: number;
}

export interface SummaryResponse {
  totals: {
    services: number;
    men: number;
    women: number;
    children: number;
    firstTimers: number;
    newConverts: number;
    holyGhostBaptisms: number;
    online: number;
    ushers: number;
    choir: number;
    total: number;
  };
  byServiceType: Array<{
    _id: ServiceType;
    services: number;
    men: number;
    women: number;
    children: number;
    firstTimers: number;
    newConverts: number;
    holyGhostBaptisms: number;
    online: number;
    ushers: number;
    choir: number;
    total: number;
  }>;
}

export interface DailyPoint {
  _id: string; // date
  services: number;
  total: number;
  men: number;
  women: number;
  children: number;
  firstTimers: number;
  newConverts: number;
  holyGhostBaptisms: number;
}

export interface WeeklyPoint {
  _id: { year: number; week: number };
  services: number;
  total: number;
  firstTimers: number;
  newConverts: number;
  holyGhostBaptisms: number;
}
