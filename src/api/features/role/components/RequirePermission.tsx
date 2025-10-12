import type { ReactNode } from "react";
import type { PermissionKey } from "../types/roleTypes";
import { useMemo } from "react";
import { useAuthStore } from "../../auth/store/useAuthStore";

const makeCan = (permissions?: PermissionKey[]) => {
  const set = new Set(permissions || []);
  return {
    any: (arr: PermissionKey[]) => arr.some((p) => set.has(p)),
    all: (arr: PermissionKey[]) => arr.every((p) => set.has(p)),
  };
};

export default function RequirePermission({
  anyOf,
  allOf,
  fallback = null,
  children,
}: {
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const perms = (user as any)?.permissions as PermissionKey[] | undefined;
  const can = useMemo(() => makeCan(perms), [perms]);

  const passAny = anyOf ? can.any(anyOf) : true;
  const passAll = allOf ? can.all(allOf) : true;

  return passAny && passAll ? <>{children}</> : <>{fallback}</>;
}
