// src/api/features/followup/components/AssigneePicker.tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { User as UserIcon, Check, ChevronsUpDown } from "lucide-react";
import { useUsersByChurch } from "../../users/hooks/useUsersByChurch";

export default function AssigneePicker({
  churchId,
  value,
  onChange,
  disabled,
  className,
}: {
  churchId?: string;
  value?: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const qDebounced = useDebounced(q, 200);
  const query = useUsersByChurch(churchId, qDebounced);
  const loading = disabled || query.isLoading;

  const items = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items) ?? [],
    [query.data]
  );

  const selected = items.find((u) => String(u._id) === value);

  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
        Assign to user
      </label>

      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={loading || !churchId}
          placeholder={loading ? "Loading users…" : "Search name/email/phone…"}
          className="w-full rounded-lg border bg-white/90 dark:bg-slate-800/70 px-3 py-2 pr-10 text-sm"
        />
        <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      <div className="mt-2 max-h-56 overflow-auto rounded-lg border bg-white/90 dark:bg-slate-900/70">
        {!churchId ? (
          <div className="p-3 text-xs text-slate-500">Pick a church first.</div>
        ) : loading ? (
          <div className="p-3 text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-slate-500">No users found.</div>
        ) : (
          <ul className="divide-y divide-slate-200/60 dark:divide-white/10">
            {items.map((u) => {
              const isActive = String(u._id) === value;
              return (
                <li key={String(u._id)}>
                  <button
                    type="button"
                    onClick={() => onChange(isActive ? null : String(u._id))}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50/70 dark:hover:bg-white/5 ${
                      isActive ? "bg-amber-50 dark:bg-amber-400/10" : ""
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                    {isActive && <Check className="ml-auto w-4 h-4 text-amber-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Load more */}
        {query.hasNextPage && (
          <button
            onClick={() => query.fetchNextPage()}
            className="w-full text-xs py-2 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Load more…
          </button>
        )}
      </div>

      {selected && (
        <p className="text-[11px] text-slate-500">
          Assigned to <span className="font-medium">{selected.firstName} {selected.lastName}</span>
        </p>
      )}
    </div>
  );
}

function useDebounced<T>(val: T, ms = 200) {
  const [v, setV] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setV(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return v;
}
