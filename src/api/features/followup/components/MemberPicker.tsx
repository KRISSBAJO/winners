// MemberServerPicker.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronsUpDown, User, Check } from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { useMemberSearchInfinite } from "../../members/hooks/useMembers";

export default function MemberServerPicker({
  churchId, value, onChange,
}: { churchId?: string; value?: string; onChange:(id:string)=>void }) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 250);
  const minChars = 2;

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch,
  } = useMemberSearchInfinite(churchId, debouncedQ.length >= minChars ? debouncedQ : "", 50);

  useEffect(() => { if (churchId) refetch(); }, [churchId, refetch]);
  const rows = useMemo(() => (data?.pages ?? []).flatMap(p => p.items), [data]);

  // keyboard nav
  const [idx, setIdx] = useState<number>(-1);
  useEffect(() => { setIdx(-1); }, [debouncedQ, churchId]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!rows.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, rows.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && idx >= 0) { e.preventDefault(); onChange(rows[idx]._id); }
  }, [rows, idx, onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium">Select Member</label>
      <div className="relative">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!churchId || isLoading}
          placeholder={!churchId ? "Pick a church first" : `Search name, email, phone…${debouncedQ.length < minChars ? ` (min ${minChars})` : ""}`}
          className="w-full rounded-lg border px-3 py-2 pr-10"
        />
        <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      <div className="mt-2 h-72 rounded-lg border bg-white dark:bg-slate-900">
        {!churchId ? (
          <EmptyMessage>Pick a church to search members.</EmptyMessage>
        ) : debouncedQ.length < minChars ? (
          <EmptyMessage>Type at least {minChars} characters to search.</EmptyMessage>
        ) : (
          <Virtuoso
            data={rows}
            endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
            itemContent={(i, m) => {
              const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "(No name)";
              const sub = m.email || m.phone || "";
              const active = value === m._id;
              const focused = i === idx;

              return (
                <button
                  type="button"
                  onClick={() => onChange(m._id)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 border-b last:border-b-0
                    ${active ? "bg-amber-50" : focused ? "bg-slate-50" : "hover:bg-slate-50"}`}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{name}</div>
                    {sub && <div className="text-xs text-slate-500 truncate">{sub}</div>}
                  </div>
                  {active && <Check className="ml-auto w-4 h-4 text-amber-600" />}
                </button>
              );
            }}
            components={{
              Footer: () => (
                <div className="p-2 text-center text-xs text-slate-500">
                  {isFetchingNextPage ? "Loading more…" : hasNextPage ? "" : rows.length ? "End of results" : ""}
                </div>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}

/* helpers */
function useDebounce<T>(val:T, ms:number){
  const [v,setV]=useState(val);
  useEffect(()=>{ const t=setTimeout(()=>setV(val),ms); return ()=>clearTimeout(t); },[val,ms]);
  return v;
}
function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <div className="h-full grid place-items-center text-sm text-slate-500">{children}</div>;
}
