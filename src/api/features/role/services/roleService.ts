import apiClient from "../../../../lib/apiClient";
import type { Role, CreateRoleInput, UpdateRoleInput, PermissionKey } from "../types/roleTypes";

export const roleService = {
  list: async (): Promise<Role[]> => {
    const { data } = await apiClient.get("/roles");
    return data;
  },

  get: async (id: string): Promise<Role> => {
    const { data } = await apiClient.get(`/roles/${id}`);
    return data;
  },

  create: async (payload: CreateRoleInput): Promise<Role> => {
    const { data } = await apiClient.post("/roles", payload);
    return data;
  },

  update: async (id: string, payload: UpdateRoleInput): Promise<Role> => {
    const { data } = await apiClient.put(`/roles/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

   permissionKeys: async (): Promise<PermissionKey[]> => {
    const { data } = await apiClient.get("/roles/permissions");
    if (Array.isArray(data)) return data as PermissionKey[];
    if (Array.isArray((data as any)?.keys)) return (data as any).keys as PermissionKey[];
    if (Array.isArray((data as any)?.values)) return (data as any).values.map((value: unknown) => value as PermissionKey);
    return [];
  },

  replacePermissions: async (id: string, body: { permissions: PermissionKey[] }): Promise<Role> => {
    const { data } = await apiClient.patch(`/roles/${id}/permissions`, body);
    return data;
  },


  syncMatrix: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.post(`/roles/matrix/sync`, {});
    return data;
  },


  addPermissions: async (id: string, permissions: PermissionKey[]): Promise<Role> => {
    const { data } = await apiClient.post(`/roles/${id}/permissions/add`, { permissions });
    return data;
  },

  removePermissions: async (id: string, permissions: PermissionKey[]): Promise<Role> => {
    const { data } = await apiClient.post(`/roles/${id}/permissions/remove`, { permissions });
    return data;
  },
};
