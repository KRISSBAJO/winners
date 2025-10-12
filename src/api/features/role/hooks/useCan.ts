import { useMemo } from "react";
import { makeCan } from "./useRoles";
import type { PermissionKey } from "../types/roleTypes";
import { useAuthStore } from "../../auth/store/useAuthStore"; // adjust path

export const useCan = () => {
  const user = useAuthStore((s) => s.user);
  const perms = (user as any)?.permissions as PermissionKey[] | undefined;
  return useMemo(() => makeCan(perms), [perms]);
};
