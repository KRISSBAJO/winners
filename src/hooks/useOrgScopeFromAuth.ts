import { useMemo } from "react";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";

export type ScopeValue = { nationalId?: string; districtId?: string; churchId?: string };
export type Locks = { national?: boolean; district?: boolean; church?: boolean };

export function useOrgScopeFromAuth(): { value: ScopeValue; locks: Locks } {
  const { user } = useAuthStore();

  const role = user?.role;

  // Each may be an ObjectId or a populated doc — normalize to string id
  const nationalId = (user as any)?.nationalChurchId
    ? String((user as any).nationalChurchId._id ?? (user as any).nationalChurchId)
    : undefined;

  const districtId = (user as any)?.districtId
    ? String((user as any).districtId._id ?? (user as any).districtId)
    : undefined;

  const churchId = (user as any)?.churchId
    ? String((user as any).churchId._id ?? (user as any).churchId)
    : undefined;

  return useMemo(() => {
    switch (role) {
      case "siteAdmin":
        // No prefill, no locks
        return { value: {}, locks: {} };

      case "nationalPastor":
        // Prefill national, lock national only
        return {
          value: { nationalId },
          locks: { national: true, district: false, church: false },
        };

      case "districtPastor":
        // Prefill national+district, lock both
        return {
          value: { nationalId, districtId },
          locks: { national: true, district: true, church: false },
        };

      case "churchAdmin":
      case "pastor":
      case "volunteer":
        // Prefill all and lock all
        return {
          value: { nationalId, districtId, churchId },
          locks: { national: true, district: true, church: true },
        };

      default:
        return { value: {}, locks: {} };
    }
  }, [role, nationalId, districtId, churchId]);
}
