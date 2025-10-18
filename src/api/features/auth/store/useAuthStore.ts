// src/api/features/auth/store/useAuthStore.ts
import { create } from "zustand";
import type { User } from "../types/authTypes";

/** Align with backend token keys */
export type OrgScope = { nationalChurchId?: string; districtId?: string; churchId?: string };
export type ActingOverride = { roleLike: "churchAdmin" | "districtPastor" | "nationalPastor" | "pastor"; scope: OrgScope; until?: string };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  scope: OrgScope;

  /** Acting menu override (UI-only “pretend role”) */
  actingOverride: ActingOverride | null;

  setAuth: (data: { user: User | null; accessToken: string; refreshToken: string }) => void;
  setScope: (scope: OrgScope) => void;

  /** Enable/disable acting menus */
  setActingOverride: (ovr: ActingOverride | null) => void;

  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  scope: JSON.parse(localStorage.getItem("scope") || "{}"),
  actingOverride: JSON.parse(localStorage.getItem("actingOverride") || "null"),

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

  setActingOverride: (ovr) => {
    if (ovr) localStorage.setItem("actingOverride", JSON.stringify(ovr));
    else localStorage.removeItem("actingOverride");
    set({ actingOverride: ovr });
  },

  clearAuth: () => {
    // Keep *only* theme etc. If you want a clean slate:
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("scope");
    localStorage.removeItem("actingOverride");
    set({ user: null, accessToken: null, refreshToken: null, scope: {}, actingOverride: null });
  },
}));
