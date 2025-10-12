// src/api/features/attendance/services/attendanceAdminService.ts
import api from "../../../../lib/apiClient";
export type AdminSummaryTotals = {
  services: number;
  men: number; women: number; children: number;
  firstTimers: number; newConverts: number; holyGhostBaptisms: number;
  online: number; ushers: number; choir: number;
  total: number;
};

export type AdminSummaryResponse = {
  totals: AdminSummaryTotals;
  byServiceType: Array<{
    _id: string; // serviceType
    services: number;
    men: number; women: number; children: number;
    firstTimers: number; newConverts: number; holyGhostBaptisms: number;
    online: number; ushers: number; choir: number;
    total: number;
  }>
};

export type DailyPoint = {
  _id: string | Date; // serviceDate
  total: number;
  men: number; women: number; children: number;
  firstTimers: number; newConverts: number; holyGhostBaptisms: number;
};

export type LeaderboardItem = {
  _id: string;         // churchId
  churchName: string;  // from controller projection
  total: number;
  services: number;
  firstTimers: number;
  newConverts: number;
};

export type AdminParams = {
  nationalId?: string;
  districtId?: string;
  churchId?: string;
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
  serviceType?: string;
  limit?: number;
};

export const attendanceAdminService = {
  summary(params: AdminParams) {
    return api.get<AdminSummaryResponse>("/attendance/admin/summary", { params }).then(r => r.data);
  },
  timeseries(params: AdminParams) {
    return api.get<DailyPoint[]>("/attendance/admin/timeseries", { params }).then(r => r.data);
  },
  leaderboard(params: AdminParams) {
    return api.get<LeaderboardItem[]>("/attendance/admin/leaderboard", { params }).then(r => r.data);
  },
};
