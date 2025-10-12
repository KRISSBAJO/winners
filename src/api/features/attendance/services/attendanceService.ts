import axios from "../../../../lib/apiClient";
import {
  Attendance,
  AttendanceCreate,
  AttendanceListResponse,
  AttendanceUpsertPayload,
  SummaryResponse,
  DailyPoint,
  WeeklyPoint,
} from "../types/attendanceTypes";

export const attendanceService = {
  list(params: Partial<Record<string, any>>) {
    return axios.get<AttendanceListResponse>("/attendance", { params }).then(r => r.data);
  },

  create(payload: AttendanceCreate) {
    return axios.post<Attendance>("/attendance", payload).then(r => r.data);
  },

  upsert(payload: AttendanceUpsertPayload) {
    return axios.post<Attendance>("/attendance/upsert", payload).then(r => r.data);
  },

  get(id: string) {
    return axios.get<Attendance>(`/attendance/${id}`).then(r => r.data);
  },

  update(id: string, payload: Partial<AttendanceCreate>) {
    return axios.put<Attendance>(`/attendance/${id}`, payload).then(r => r.data);
  },

  remove(id: string) {
    return axios.delete<{ message: string }>(`/attendance/${id}`).then(r => r.data);
  },

  summary(params: { churchId: string; from?: string; to?: string }) {
    return axios.get<SummaryResponse>("/attendance/summary", { params }).then(r => r.data);
  },

  timeseriesDaily(params: { churchId: string; from?: string; to?: string; serviceType?: string }) {
    return axios.get<DailyPoint[]>("/attendance/timeseries", { params }).then(r => r.data);
  },

  weekly(params: { churchId: string; from?: string; to?: string }) {
    return axios.get<WeeklyPoint[]>("/attendance/weekly", { params }).then(r => r.data);
  },

  exportCSV(params: { churchId: string; from?: string; to?: string; serviceType?: string }) {
    return axios.get("/attendance/export", { params, responseType: "blob" }).then(r => r.data);
  },
};
