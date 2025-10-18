import apiClient from "../../../../lib/apiClient";
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  TokensResponse,
} from "../types/authTypes";

import type { MePayload } from "../types/authTypes";



export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },

   me: async (): Promise<MePayload> => {
    const res = await apiClient.get("/auth/me");
    return res.data as MePayload;
  },

  refresh: async (refreshToken: string): Promise<TokensResponse> => {
    const res = await apiClient.post("/auth/refresh", { refreshToken });
    return res.data;
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/request-password-reset", { email });
    return res.data;
  },

  resetPassword: async ({
    token,
    newPassword,
  }: {
    token: string | null;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/reset-password", { token, newPassword });
    return res.data;
  },

  changeMyPassword: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await apiClient.post("/auth/change-my-password", { currentPassword, newPassword });
    return res.data;
  },

  listUsers: async (): Promise<User[]> => {
    const res = await apiClient.get("/auth/users");
    return res.data;
  },
};
