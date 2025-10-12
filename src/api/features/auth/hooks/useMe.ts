// src/features/auth/hooks/useMe.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { User } from "../types/authTypes";
import { useAuthStore } from "../store/useAuthStore";

export const useMe = () => {
  const { setAuth } = useAuthStore();
  const hasToken = !!localStorage.getItem("accessToken");

  const q = useQuery<User>({
    queryKey: ["me"],
    queryFn: authService.me,
    enabled: hasToken,        // only run if we have an access token
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!q.data || !q.isSuccess) return;
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) return; // don't clobber store if tokens are gone
    setAuth({ user: q.data, accessToken, refreshToken });
  }, [q.isSuccess, q.data, setAuth]);

  return q; // so callers can check isLoading/error if they want
};
