// src/pages/GroupsExplorePage.tsx
import { useMemo, useState, useEffect } from "react";
import { usePublicGroups } from "../api/features/groups/hooks/useGroups";
import { Search, Filter, Users, MapPin, Calendar } from "lucide-react";
import type { GroupPublic, GroupType } from "../api/features/groups/types/groupTypes";

const TYPES: GroupType[] = ["cell","ministry","class","prayer","outreach","youth","women","men","seniors","other"];

function useDebounce<T>(val: T, ms = 350) {
  const [v, setV] = useState(val);
  useEffect(() => { const id = setTimeout(() => setV(val), ms); return () => clearTimeout(id); }, [val, ms]);
  return v;
}

export default function GroupsExplorePage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<GroupType | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(18);

  const dq = useDebounce(q, 350);

  const params = useMemo(() => ({
    page, limit, sort: "name" as const,
    q: dq || undefined,
    type: (type as GroupType) || undefined,
  }), [page, limit, dq, type]);

  const { data, isFetching } = usePublicGroups(params);
  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;

  useEffect(() => { setPage(1); }, [dq, type, limit]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="font-serif text-slate-900" style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)" }}>All Home Fellowship Groups</h1>
        <p className="mt-1 text-[15px] text-slate-600">Browse, filter, and join a group.</p>
      </div>

      {/* Toolbar */}
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, subtitle, tags, or area…"
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white outline-none ring-2 ring-transparent focus:ring-amber-400/40"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GroupType | "")}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40 capitalize"
            >
              <option value="">All types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
          >
            {[12, 18, 24, 36].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-amber-50 grid place-items-center">
            <Search className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-slate-900 font-semibold">No groups found</h3>
          <p className="text-sm text-slate-600">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <li key={g._id} className="rounded-2xl border bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-[16/9] bg-slate-100">
                {g.coverUrl ? <img src={g.coverUrl} alt={g.name} className="w-full h-full object-cover" /> : null}
                <div className="absolute left-3 top-3 rounded-full bg-[#8B0000] px-2.5 py-1 text-[11px] font-semibold text-white capitalize">
                  {g.type}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">{g.name}</h3>
                  {typeof g.capacity === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                      <Users className="h-3.5 w-3.5" /> {g.capacity}
                    </span>
                  )}
                </div>
                {g.subtitle && <p className="mt-0.5 text-[12.5px] text-slate-500">{g.subtitle}</p>}
                {g.description && <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-600">{g.description}</p>}

                <div className="mt-3 space-y-1.5 text-[12.5px] text-slate-600">
                  {g.publicArea && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{g.publicArea}</span>
                    </div>
                  )}
                  {/* Optional: show a static line or fetch next times by id if you want */}
                  {/* <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Open to join</span>
                  </div> */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {data?.pages && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Page {data.page} of {data.pages} • {data.total} total {isFetching ? " • Loading…" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              Previous
            </button>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(data?.pages || 1, p + 1))}
              disabled={(!!data && page >= (data.pages || 1)) || isFetching}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
