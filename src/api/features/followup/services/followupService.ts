// src/api/features/followup/services/followupService.ts
import apiClient from "../../../../lib/apiClient";
import type {
  FollowUpCase,
  Paginated,
  ContactAttempt,
} from "../types/followupTypes";

export const followupService = {
  list: async (params?: Record<string, any>): Promise<Paginated<FollowUpCase>> => {
    const { data } = await apiClient.get("/followup", { params });
    return data;
  },
  stats: async (): Promise<{
    open: number; inProgress: number; paused: number; resolved: number;
    absentee: number; newcomer: number; evangelism: number;
  }> => {
    const { data } = await apiClient.get("/followup/stats");
    return data;
  },
  get: async (id: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.get(`/followup/${id}`);
    return data;
  },
  open: async (payload: Partial<FollowUpCase>): Promise<FollowUpCase> => {
    const { data } = await apiClient.post("/followup", payload);
    return data;
  },
  update: async (id: string, payload: Partial<FollowUpCase>): Promise<FollowUpCase> => {
    const { data } = await apiClient.put(`/followup/${id}`, payload);
    return data;
  },
  assign: async (id: string, assignedTo: string | null): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/assign`, { assignedTo });
    return data;
  },
  pause: async (id: string, note?: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/pause`, { note });
    return data;
  },
  resume: async (id: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/resume`, {});
    return data;
  },
  resolve: async (id: string, note?: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/resolve`, { note });
    return data;
  },
  archive: async (id: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/archive`, {});
    return data;
  },
  addTag: async (id: string, tag: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/tags/add`, { tag });
    return data;
  },
  removeTag: async (id: string, tag: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/tags/remove`, { tag });
    return data;
  },
  updateConsent: async (id: string, consent: { email?: boolean; sms?: boolean; call?: boolean }): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/consent`, consent);
    return data;
  },
  setCadence: async (id: string, cadenceId: string | null): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/cadence`, { cadenceId });
    return data;
  },
  advanceCadence: async (id: string): Promise<FollowUpCase> => {
    const { data } = await apiClient.post(`/followup/${id}/cadence/advance`, {});
    return data;
  },
  cadences: {
    list: async (): Promise<Array<{_id:string; name:string; type?:string; steps?: any[]}>> => {
      const { data } = await apiClient.get("/followup/cadences");
      return data;
    },
  },
  attempts: {
    list: async (id: string): Promise<ContactAttempt[]> => {
      const { data } = await apiClient.get(`/followup/${id}/attempts`);
      return data;
    },
    log: async (id: string, payload: {
      channel: ContactAttempt["channel"];
      outcome: ContactAttempt["outcome"];
      content?: string;
      nextActionOn?: string;
    }): Promise<ContactAttempt> => {
      const { data } = await apiClient.post(`/followup/${id}/attempts`, payload);
      return data;
    },
  },
};
