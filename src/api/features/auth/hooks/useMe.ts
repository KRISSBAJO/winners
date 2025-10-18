// src/api/features/auth/hooks/useMe.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { MePayload } from "../types/authTypes";
import { useAuthStore } from "../store/useAuthStore";

/** Quick heuristic: infer a role-like from permissions to show the most helpful menus */
function inferRoleLikeFromPerms(perms: string[] = []): "churchAdmin" | "districtPastor" | "nationalPastor" | "pastor" | null {
  const has = (p: string) => perms.includes(p);
  if (has("user.create") || has("member.update") || has("attendance.export")) return "churchAdmin";
  if (has("district.read") && !has("user.create")) return "districtPastor";
  if (has("national.read") && !has("district.read")) return "nationalPastor";
  if (has("member.read")) return "pastor";
  return null;
}

export const useMe = () => {
  const { setAuth, setActingOverride, actingOverride, scope } = useAuthStore();
  const hasToken = !!localStorage.getItem("accessToken");

  const q = useQuery<MePayload>({
    queryKey: ["me"],
    queryFn: authService.me,
    enabled: hasToken,
    staleTime: 60_000,
    refetchOnWindowFocus: true, // helps menus update shortly after a delegation is created
  });

  useEffect(() => {
    if (!q.data || !q.isSuccess) return;

    // keep tokens already stored
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) return;

    // Update the stored user
    setAuth({ user: q.data, accessToken, refreshToken });

    // OPTIONAL: If the user has active delegations and hasn't chosen a menu yet,
    // automatically enable a helpful acting menu (can be turned off by the banner control).
    const hasDelegations = (q.data.delegatedScopes ?? []).length > 0;
    if (hasDelegations && !actingOverride) {
      const roleLike = inferRoleLikeFromPerms(q.data.permissions || []) || "churchAdmin";
      setActingOverride({ roleLike, scope, until: undefined });
    }
  }, [q.isSuccess, q.data, setAuth, setActingOverride, actingOverride, scope]);

  return q;
};
