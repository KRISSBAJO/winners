// src/api/features/users/services/userService.ts
import apiClient from "../../../../lib/apiClient";
import type { User } from "../../auth/types/authTypes";

export interface UpdateProfileInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  avatar?: File | null;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  role: "siteAdmin" | "nationalPastor" | "districtPastor" | "churchAdmin" | "pastor" | "volunteer";
  churchId?: string;
  districtId?: string;
  nationalChurchId?: string;
  phone?: string;
  password?: string; // or server generates
}

export interface AdminUpdateInput extends Partial<CreateUserInput> {
  isActive?: boolean;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const res = await apiClient.get("/users");
    return res.data;
  },

  getById: async (id: string): Promise<User> => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k !== "avatar" && v) formData.append(k, v as string);
    });
    if (data.avatar instanceof File) formData.append("avatar", data.avatar);
    const res = await apiClient.put("/users/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** ✅ Create user (admin/site/church depending on permissions) */
  create: async (payload: CreateUserInput): Promise<User> => {
    const res = await apiClient.post("/users", payload);
    return res.data;
  },

  /** ✅ Admin update user */
  adminUpdate: async (id: string, payload: AdminUpdateInput): Promise<User> => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },

  toggleActive: async (id: string): Promise<User> => {
    const res = await apiClient.patch(`/users/${id}/toggle-active`);
    return res.data.user;
  },

  remove: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};
