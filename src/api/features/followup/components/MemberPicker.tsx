// src/api/features/followup/components/MemberServerPicker.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, User, Check } from "lucide-react";
import { useMemberSearchInfinite } from "../../members/hooks/useMembers";

export default function MemberServerPicker({
  churchId, value, onChange,
}: { churchId?: string; value?: string; onChange:(id:string)=>void }) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 250);
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useMemberSearchInfinite(churchId, debouncedQ, 30);

  useEffect(() => { if (churchId) refetch(); }, [churchId, refetch]);

  const rows = useMemo(() => (data?.pages ?? []).flatMap(p => p.items), [data]);
  const sentinelRef = useInfiniteLoader(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium">Select Member</label>
      <div className="relative">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          disabled={!churchId || isLoading}
          placeholder={!churchId ? "Pick a church first" : "Search name, email, phone…"}
          className="w-full rounded-lg border px-3 py-2 pr-10"
        />
        <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      <div className="mt-2 max-h-72 overflow-auto rounded-lg border">
        {!churchId ? (
          <div className="p-3 text-sm text-slate-500">Pick a church to search members.</div>
        ) : rows.length === 0 && !isLoading ? (
          <div className="p-3 text-sm text-slate-500">No results.</div>
        ) : (
          <ul className="divide-y">
            {rows.map((m) => {
              const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "(No name)";
              const sub = m.email || m.phone || "";
              const active = value === m._id;
              return (
                <li key={m._id}>
                  <button
                    type="button"
                    onClick={() => onChange(m._id)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 ${active ? "bg-amber-50" : ""}`}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{name}</div>
                      {sub && <div className="text-xs text-slate-500 truncate">{sub}</div>}
                    </div>
                    {active && <Check className="ml-auto w-4 h-4 text-amber-600" />}
                  </button>
                </li>
              );
            })}
            <li ref={sentinelRef as any}>
              {isFetchingNextPage && (
                <div className="p-3 text-xs text-slate-500">Loading more…</div>
              )}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

/* small helpers */
function useDebounce<T>(val:T, ms:number){
  const [v,setV]=useState(val);
  useEffect(()=>{ const t=setTimeout(()=>setV(val),ms); return ()=>clearTimeout(t); },[val,ms]);
  return v;
}
function useInfiniteLoader(cb:()=>void){
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    const io = new IntersectionObserver((entries)=>{ if(entries[0].isIntersecting) cb(); });
    io.observe(el); return ()=>io.disconnect();
  },[cb]);
  return ref;
}
