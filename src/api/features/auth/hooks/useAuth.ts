import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import type { AuthResponse, LoginInput, RegisterInput, TokensResponse } from "../types/authTypes";

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const registerMutation = useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const refreshMutation = useMutation<TokensResponse, Error, string>({
    mutationFn: authService.refresh,
    onSuccess: (tokens) => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      setAuth({
        user: currentUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    },
    onError: () => {
      clearAuth();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changeMyPassword,
  });

  const logout = useCallback(() => {
    clearAuth();
    queryClient.clear();
  }, [clearAuth, queryClient]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    isLoading:
      loginMutation.isPending || registerMutation.isPending || refreshMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    refresh: refreshMutation.mutateAsync,
    changeMyPassword: changePasswordMutation.mutateAsync,
    logout,
    error: loginMutation.error || registerMutation.error || refreshMutation.error,
    loginStatus: loginMutation.status,
    registerStatus: registerMutation.status,
  };
}
