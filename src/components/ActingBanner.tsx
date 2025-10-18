// src/components/ActingBanner.tsx
import { useMemo } from "react";
import { ShieldCheck, X } from "lucide-react";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";
import { useMe } from "../api/features/auth/hooks/useMe";
import { toast } from "sonner";

type DelegatedScope = {
  nationalChurchId?: string;
  districtId?: string;
  churchId?: string;
};

function coversScope(
  delegated: DelegatedScope,
  current: DelegatedScope
) {
  if (delegated.nationalChurchId && delegated.nationalChurchId !== current.nationalChurchId) return false;
  if (delegated.districtId && delegated.districtId !== current.districtId) return false;
  if (delegated.churchId && delegated.churchId !== current.churchId) return false;
  return true;
}

export default function ActingBanner() {
  const { scope, actingOverride, setActingOverride } = useAuthStore();
  const meQ = useMe();

  // ✅ Safely read delegatedScopes from either payload shape
  const delegatedScopes: DelegatedScope[] = useMemo(() => {
    const d = meQ.data;
    if (!d) return [];
    return "delegatedScopes" in d ? (d.delegatedScopes ?? []) : [];
  }, [meQ.data]);

  const activeActing = useMemo(() => {
    const hasCovering = delegatedScopes.some((d) => coversScope(d, scope));
    return {
      hasCovering,
      until: actingOverride?.until,
      roleLike: actingOverride?.roleLike,
    };
  }, [delegatedScopes, scope, actingOverride?.until, actingOverride?.roleLike]);

  if (!activeActing.hasCovering) return null;

  const label = activeActing.roleLike
    ? `You’re acting as ${activeActing.roleLike}`
    : `Acting permissions active`;

  const untilTxt = activeActing.until
    ? ` until ${new Date(activeActing.until).toLocaleString()}`
    : "";

  return (
    <div className="mx-3 my-2 rounded-xl border bg-amber-50 text-amber-900 border-amber-200 px-3 py-2 text-xs sm:text-sm flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="truncate">
          {label}
          {untilTxt}. You may see extra menus & actions.
        </span>
      </div>

      {actingOverride ? (
        <button
          onClick={() => {
            setActingOverride(null);
            toast.info("Switched back to your regular menus.");
          }}
          className="text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 font-medium"
        >
          <X className="w-3 h-3" /> Exit acting
        </button>
      ) : (
        <button
          onClick={() => {
            // If you have roleLike/endsAt per-delegation elsewhere, set them here.
            setActingOverride({ roleLike: "churchAdmin", scope, until: undefined });
            toast.success("Acting menus enabled (Church Admin).");
          }}
          className="underline font-semibold"
        >
          Use acting menus
        </button>
      )}
    </div>
  );
}
