import apiClient from "../../../../lib/apiClient";
import type { Event, EventListResponse, CreateEventInput, UpdateEventInput } from "../types/eventTypes";

/* Helpers */
function toQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) q.append(k, v.join(","));
    else q.append(k, String(v));
  });
  return q.toString();
}

function toFormData(payload: any) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v == null) return;
    if (k === "tags" && Array.isArray(v)) fd.append(k, JSON.stringify(v));
    else if (k === "cover" && v instanceof File) fd.append("cover", v);
    else fd.append(k, String(v));
  });
  return fd;
}

export const eventService = {
  // PUBLIC
  listPublic: async (params: Partial<Record<string, any>>): Promise<EventListResponse> => {
    const qs = toQuery(params);
    const { data } = await apiClient.get(`/events/public${qs ? `?${qs}` : ""}`);
    return data;
  },
  getPublic: async (id: string): Promise<Event> => {
    const { data } = await apiClient.get(`/events/${id}/public`);
    return data;
  },

  // AUTH
  list: async (params: Partial<Record<string, any>>): Promise<EventListResponse> => {
    const qs = toQuery(params);
    const { data } = await apiClient.get(`/events${qs ? `?${qs}` : ""}`);
    return data;
  },
  get: async (id: string): Promise<Event> => {
    const { data } = await apiClient.get(`/events/${id}`);
    return data;
  },
  create: async (payload: CreateEventInput | any) => {
    const hasFile = payload?.cover instanceof File;
    if (hasFile) {
      const fd = toFormData(payload);
      const { data } = await apiClient.post("/events", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }
    const { data } = await apiClient.post("/events", payload);
    return data;
  },
  update: async (id: string, payload: UpdateEventInput | any) => {
    const hasFile = payload?.cover instanceof File;
    if (hasFile) {
      const fd = toFormData(payload);
      const { data } = await apiClient.put(`/events/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }
    const { data } = await apiClient.put(`/events/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  like: async (id: string): Promise<Event> => {
    const { data } = await apiClient.post(`/events/${id}/like`);
    return data;
  },
  unlike: async (id: string): Promise<Event> => {
    const { data } = await apiClient.post(`/events/${id}/unlike`);
    return data;
  },

  addComment: async (id: string, text: string): Promise<Event> => {
    const { data } = await apiClient.post(`/events/${id}/comments`, { text });
    return data;
  },
  updateComment: async (id: string, commentId: string, text: string): Promise<Event> => {
    const { data } = await apiClient.put(`/events/${id}/comments/${commentId}`, { text });
    return data;
  },
  deleteComment: async (id: string, commentId: string): Promise<Event> => {
    const { data } = await apiClient.delete(`/events/${id}/comments/${commentId}`);
    return data;
  },
};
