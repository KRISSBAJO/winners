import apiClient from "../../../../lib/apiClient";
import type { Member, CreateMemberInput, UpdateMemberInput } from "../types/memberTypes";

export type SelfRegKind = "short" | "long";
export type VerifySelfRegResponse = { email: string; churchId: string; kind: SelfRegKind };

export const memberService = {
  list: async (params?: Record<string, any>): Promise<Member[]> => {
    const { data } = await apiClient.get("/members", { params });
    return data;
  },
  listByChurch: async (churchId: string): Promise<Member[]> => {
    const { data } = await apiClient.get(`/members/church/${churchId}`);
    return data;
  },
  create: async (payload: CreateMemberInput): Promise<Member> => {
    const { data } = await apiClient.post("/members", payload);
    return data;
  },
  update: async (id: string, payload: UpdateMemberInput): Promise<Member> => {
    const { data } = await apiClient.put(`/members/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/members/${id}`);
  },
  get: async (id: string): Promise<Member> => {
    const { data } = await apiClient.get(`/members/${id}`);
    return data;
  },
  stats: async (): Promise<{ total: number; active: number; visitors: number; converts: number }> => {
    const { data } = await apiClient.get("/members/stats");
    return data;
  },
  leaders: async (): Promise<Member[]> => {
    const { data } = await apiClient.get("/members/leaders");
    return data;
  },
  birthdays: async (month: number): Promise<Member[]> => {
    const { data } = await apiClient.get(`/members/birthdays/${month}`);
    return data;
  },
  anniversaries: async (month: number): Promise<Member[]> => {
    const { data } = await apiClient.get(`/members/anniversaries/${month}`);
    return data;
  },
  upload: async (file: File, churchId: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("churchId", churchId);
    const { data } = await apiClient.post("/members/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { successCount: number; failedCount: number; errors: any[] };
  },
  downloadTemplate: async (): Promise<Blob> => {
    const res = await apiClient.get("/members/template", { responseType: "blob" });
    return res.data;
  },
  invite: async (email: string, churchId: string) => {
    const { data } = await apiClient.post("/members/invite", { email, churchId });
    return data as { message: string; link?: string };
  },
  registerWithToken: async (token: string, payload: Partial<Member>) => {
    const { data } = await apiClient.post(`/members/register/${token}`, payload);
    return data as Member;
  },
// ---------- NEW: self-register endpoints ----------
  sendSelfRegInvite: async (email: string, churchId: string, kind: SelfRegKind = "short") => {
    const { data } = await apiClient.post("/members/self-register/invite", { email, churchId, kind });
    return data as { ok: boolean; link: string };
  },

  verifySelfReg: async (token: string) => {
    const { data } = await apiClient.get("/members/self-register/verify", { params: { token } });
    return data as VerifySelfRegResponse;
  },

  selfRegisterShort: async (token: string, payload: {
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: "Male" | "Female" | "Other";
  }) => {
    const { data } = await apiClient.post("/members/self-register/short", { token, ...payload });
    return data as Member;
  },

  selfRegisterLong: async (token: string, payload: Partial<Member>) => {
    const { data } = await apiClient.post("/members/self-register/long", { token, ...payload });
    return data as Member;
  },
};
