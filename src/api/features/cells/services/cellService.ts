// src/api/features/cells/services/cellService.ts
import apiClient from "../../../../lib/apiClient";
import type {
  CellGroup, CreateCellInput, UpdateCellInput,
  CellMeeting, CreateMeetingInput, UpdateMeetingInput,
  CellAttendanceReport, SubmitReportInput, MeetingsQuery, ReportsQuery, AnalyticsQuery
} from "../types/cellTypes";

const DEBUG = false;

function unwrapList(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  return [];
}

export const cellService = {
  listCells: async (params?: any): Promise<CellGroup[]> => {
    const apiParams = {
      ...params,
      nationalChurchId: params?.nationalChurchId ?? params?.nationalId,
    };
    if (DEBUG) console.log("[cellService.listCells] →", apiParams);
    const { data } = await apiClient.get("/cells", { params: apiParams });
    return unwrapList(data);
  },

  getCell: async (id: string): Promise<CellGroup> => {
    if (DEBUG) console.log("[cellService.getCell] id →", id);
    const { data } = await apiClient.get(`/cells/${id}`);
    return (data?.data ?? data) as CellGroup;
  },

  createCell: async (payload: CreateCellInput): Promise<CellGroup> => {
    if (DEBUG) console.log("[cellService.createCell] →", payload);
    const { data } = await apiClient.post("/cells", payload);
    return (data?.data ?? data) as CellGroup;
  },

  updateCell: async (id: string, payload: UpdateCellInput): Promise<CellGroup> => {
    if (DEBUG) console.log("[cellService.updateCell] id, payload →", id, payload);
    const { data } = await apiClient.put(`/cells/${id}`, payload);
    return (data?.data ?? data) as CellGroup;
  },

  deleteCell: async (id: string): Promise<void> => {
    if (DEBUG) console.log("[cellService.deleteCell] id →", id);
    await apiClient.delete(`/cells/${id}`);
  },

  addMembers: async (id: string, memberIds: string[]): Promise<CellGroup> => {
    if (DEBUG) console.log("[cellService.addMembers] id, memberIds →", id, memberIds);
    const { data } = await apiClient.post(`/cells/${id}/members`, { memberIds });
    return (data?.data ?? data) as CellGroup;
  },

  removeMember: async (id: string, memberId: string): Promise<CellGroup> => {
    if (DEBUG) console.log("[cellService.removeMember] id, memberId →", id, memberId);
    const { data } = await apiClient.delete(`/cells/${id}/members/${memberId}`);
    return (data?.data ?? data) as CellGroup;
  },

  /* Meetings */
  listMeetings: async (params?: MeetingsQuery) => {
    const apiParams = {
      ...params,
      nationalChurchId: params?.nationalChurchId ?? params?.nationalId,
      onlyUnreported: (params as any)?.onlyUnreported ?? undefined, // ← pass it through
    };
    const { data } = await apiClient.get("/cells/meetings", { params: apiParams });
    return unwrapList(data);
  },

  createMeeting: async (payload: CreateMeetingInput): Promise<CellMeeting> => {
    if (DEBUG) console.log("[cellService.createMeeting] →", payload);
    const { data } = await apiClient.post("/cells/meetings", payload);
    return (data?.data ?? data) as CellMeeting;
  },

  updateMeeting: async (id: string, payload: UpdateMeetingInput): Promise<CellMeeting> => {
    if (DEBUG) console.log("[cellService.updateMeeting] id, payload →", id, payload);
    const { data } = await apiClient.put(`/cells/meetings/${id}`, payload);
    return (data?.data ?? data) as CellMeeting;
  },

  deleteMeeting: async (id: string): Promise<void> => {
    if (DEBUG) console.log("[cellService.deleteMeeting] id →", id);
    await apiClient.delete(`/cells/meetings/${id}`);
  },

  /* Reports */
  listReports: async (params?: ReportsQuery) => {
    const apiParams = {
      ...params,
      nationalChurchId: params?.nationalChurchId ?? params?.nationalId,
    };
    if (DEBUG) console.log("[cellService.listReports] →", apiParams);
    const { data } = await apiClient.get("/cells/reports", { params: apiParams });
    return unwrapList(data);
  },

  updateReport: async (id: string, payload: Partial<CellAttendanceReport>): Promise<CellAttendanceReport> => {
    const { data } = await apiClient.put(`/cells/reports/${id}`, payload);
    return (data?.data ?? data) as CellAttendanceReport;
  },


  submitReport: async (payload: SubmitReportInput): Promise<CellAttendanceReport> => {
    if (DEBUG) console.log("[cellService.submitReport] →", payload);
    const { data } = await apiClient.post("/cells/reports", payload);
    return (data?.data ?? data) as CellAttendanceReport;
  },
 
  deleteReport: async (id: string): Promise<void> => {
    if (DEBUG) console.log("[cellService.deleteReport] id →", id);
    await apiClient.delete(`/cells/reports/${id}`);
  },
  analytics: async (params: AnalyticsQuery) => {
    const apiParams = { ...params };
    if (DEBUG) console.log("[cellService.analytics] →", apiParams);
    const { data } = await apiClient.get("/cells/analytics", { params: apiParams });
    return (data?.data ?? data) as {
      totalMeetings: number;
      cellsCreated: number;
      totals: { men: number; women: number; children: number; firstTimers: number; newConverts: number };
    };
  },
};
