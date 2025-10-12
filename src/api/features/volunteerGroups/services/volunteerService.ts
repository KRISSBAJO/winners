import apiClient from "../../../../lib/apiClient";
import type { VolunteerGroup, CreateGroupInput, UpdateGroupInput } from "../types/volunteerTypes";

export const volunteerService = {
  list: async (): Promise<VolunteerGroup[]> => {
    const { data } = await apiClient.get("/volunteer-groups");
    return data;
  },
  listByChurch: async (churchId: string): Promise<VolunteerGroup[]> => {
    const { data } = await apiClient.get(`/volunteer-groups/church/${churchId}`);
    return data;
  },
  get: async (id: string): Promise<VolunteerGroup> => {
    const { data } = await apiClient.get(`/volunteer-groups/${id}`);
    return data;
  },
  create: async (payload: CreateGroupInput): Promise<VolunteerGroup> => {
    const { data } = await apiClient.post("/volunteer-groups", payload);
    return data;
  },
  update: async (id: string, payload: UpdateGroupInput): Promise<VolunteerGroup> => {
    const { data } = await apiClient.put(`/volunteer-groups/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/volunteer-groups/${id}`);
  },
  addMember: async (groupId: string, memberId: string): Promise<VolunteerGroup> => {
    const { data } = await apiClient.post(`/volunteer-groups/${groupId}/members`, { memberId });
    return data;
  },
  removeMember: async (groupId: string, memberId: string): Promise<VolunteerGroup> => {
    const { data } = await apiClient.delete(`/volunteer-groups/${groupId}/members/${memberId}`);
    return data;
  },
  assignLeader: async (groupId: string, leaderId: string): Promise<VolunteerGroup> => {
    const { data } = await apiClient.post(`/volunteer-groups/${groupId}/leader`, { leaderId });
    return data;
  },
};
