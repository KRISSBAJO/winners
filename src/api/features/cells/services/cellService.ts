// src/api/features/cells/services/cellService.ts
import apiClient from "../../../../lib/apiClient";
import type {
  CellGroup, CreateCellInput, UpdateCellInput,
  CellMeeting, CreateMeetingInput, UpdateMeetingInput,
  CellAttendanceReport, SubmitReportInput
} from "../types/cellTypes";

// small helper that ALWAYS gives you an array back
function unwrapList(res: any) {
  // common server shapes
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  // fallback to empty array
  return [];
}

export const cellService = {
  listCells: async (params?: any): Promise<CellGroup[]> => {
    const { data } = await apiClient.get("/cells", { params });
    return unwrapList(data);
  },

  getCell: async (id: string): Promise<CellGroup> => {
    const { data } = await apiClient.get(`/cells/${id}`);
    // this endpoint returns a single record
    return (data?.data ?? data) as CellGroup;
  },

  createCell: async (payload: CreateCellInput): Promise<CellGroup> => {
    const { data } = await apiClient.post("/cells", payload);
    return (data?.data ?? data) as CellGroup;
  },

  updateCell: async (id: string, payload: UpdateCellInput): Promise<CellGroup> => {
    const { data } = await apiClient.put(`/cells/${id}`, payload);
    return (data?.data ?? data) as CellGroup;
  },

  deleteCell: async (id: string): Promise<void> => {
    await apiClient.delete(`/cells/${id}`);
  },

  addMembers: async (id: string, memberIds: string[]): Promise<CellGroup> => {
    const { data } = await apiClient.post(`/cells/${id}/members`, { memberIds });
    return (data?.data ?? data) as CellGroup;
  },

  removeMember: async (id: string, memberId: string): Promise<CellGroup> => {
    const { data } = await apiClient.delete(`/cells/${id}/members/${memberId}`);
    return (data?.data ?? data) as CellGroup;
  },

  /* Meetings */
  listMeetings: async (params?: { cellId?: string }) => {
    const { data } = await apiClient.get("/cells/meetings", { params });
    return Array.isArray(data) ? data : data?.items ?? [];
  },

  createMeeting: async (payload: CreateMeetingInput): Promise<CellMeeting> => {
    const { data } = await apiClient.post("/cells/meetings", payload);
    return (data?.data ?? data) as CellMeeting;
  },

  updateMeeting: async (id: string, payload: UpdateMeetingInput): Promise<CellMeeting> => {
    const { data } = await apiClient.put(`/cells/meetings/${id}`, payload);
    return (data?.data ?? data) as CellMeeting;
  },

  deleteMeeting: async (id: string): Promise<void> => {
    await apiClient.delete(`/cells/meetings/${id}`);
  },

  /* Reports */
 listReports: async (params?: { cellId?: string }) => {
    const { data } = await apiClient.get("/cells/reports", { params });
    return Array.isArray(data) ? data : data?.items ?? [];
  },

  submitReport: async (payload: SubmitReportInput): Promise<CellAttendanceReport> => {
    const { data } = await apiClient.post("/cells/reports", payload);
    return (data?.data ?? data) as CellAttendanceReport;
  },

  analytics: async (params: { churchId?: string; from?: string; to?: string }) => {
    const { data } = await apiClient.get("/cells/analytics", { params });
    return (data?.data ?? data) as {
      totalMeetings: number;
      cellsCreated: number;
      totals: { men: number; women: number; children: number; firstTimers: number; newConverts: number };
    };
  },
};
