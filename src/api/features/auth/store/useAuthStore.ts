import { create } from "zustand";
import type { User } from "../types/authTypes";

/** ✅ Align with backend token keys */
export type OrgScope = { nationalChurchId?: string; districtId?: string; churchId?: string };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  scope: OrgScope;
  setAuth: (data: { user: User | null; accessToken: string; refreshToken: string }) => void;
  setScope: (scope: OrgScope) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  scope: JSON.parse(localStorage.getItem("scope") || "{}"),

  setAuth: ({ user, accessToken, refreshToken }) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken });
  },

  setScope: (scope) => {
    localStorage.setItem("scope", JSON.stringify(scope));
    set({ scope });
  },

  clearAuth: () => {
    localStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null, scope: {} });
  },
}));
