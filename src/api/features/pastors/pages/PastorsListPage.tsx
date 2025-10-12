import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  Users2,
} from "lucide-react";
import { usePastors } from "../hooks";
import { PastorLevels, PastorTitles } from "../types";
import OrgCascader from "../../../../components/OrgCascader";
import { useOrgLabels } from "../../org/hooks/useOrgLabels";

/** Small debounce util for search */
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function PastorsListPage() {
  const [sp, setSp] = useSearchParams();

  // URL params → state
  const [q, setQ] = useState(sp.get("q") ?? "");
  const page = Number(sp.get("page") ?? 1);
  const level = sp.get("level") ?? "";
  const title = sp.get("title") ?? "";
  const nationalChurchId = sp.get("nationalChurchId") ?? "";
  const districtId = sp.get("districtId") ?? "";
  const churchId = sp.get("churchId") ?? "";

  // Debounce search text so it "just works"
  const qDebounced = useDebounced(q, 350);

  // Sync debounced q -> URL (and reset page)
  useEffect(() => {
    const next = new URLSearchParams(sp);
    if (qDebounced) next.set("q", qDebounced);
    else next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced]);

  // Stable updater for URL params
  const update = useCallback(
    (obj: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(sp);
      Object.entries(obj).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === null) next.delete(k);
        else next.set(k, String(v));
      });
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  // Data
  const { data, isLoading } = usePastors({
    q: sp.get("q") ?? undefined,
    page,
    limit: 20,
    level: (["church", "district", "national"].includes(level) ? level : undefined) as "church" | "district" | "national" | undefined,
    title: title || undefined,
    churchId: churchId || undefined,
    districtId: districtId || undefined,
    nationalChurchId: nationalChurchId || undefined,
  });

  const items = data?.items ?? [];

  // Orgs label cache (maps ids -> names so we can show nice subtitles)
  const { nationalMap, districtMap, churchMap } = useOrgLabels();

  const nationalName = (id?: string) => (id ? nationalMap.get(id) : undefined);
  const districtName = (id?: string) => (id ? districtMap.get(id) : undefined);
  const churchName = (id?: string) => (id ? churchMap.get(id) : undefined);

  // Stable cascader handler (prevents re-renders triggering effects)
  const onScopeChange = useCallback(
    (sc: { nationalId?: string; districtId?: string; churchId?: string }) =>
      update({
        nationalChurchId: sc.nationalId || undefined,
        districtId: sc.districtId || undefined,
        churchId: sc.churchId || undefined,
        page: 1,
      }),
    [update]
  );

  const canPrev = page > 1;
  const canNext = (data?.page ?? 1) < (data?.pages ?? 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          
           <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <Users2 className="inline-block w-6 h-6 mr-2 text-amber-700" />
            Pastors Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pastors, titles, and assignments across your organization
          </p>
        </div>
        <Link
          to="/dashboard/pastors/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-700 text-white px-3 py-2 text-sm hover:opacity-90 shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Pastor
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
        {/* Top row: search + selects */}
        <div className="flex flex-wrap items-end gap-3">
          {/* search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, or phone…"
              className="pl-8 pr-8 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* level */}
          <div className="inline-flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={level}
              onChange={(e) => update({ level: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              title="Level"
            >
              <option value="">All levels</option>
              {PastorLevels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            {/* title */}
            <select
              value={title}
              onChange={(e) => update({ title: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              title="Title"
            >
              <option value="">All titles</option>
              {PastorTitles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Organization scope (replaces id inputs) */}
        <OrgCascader
          value={{
            nationalId: nationalChurchId || undefined,
            districtId: districtId || undefined,
            churchId: churchId || undefined,
          }}
          onChange={onScopeChange}
          compact
        />

        {/* Active filter chips */}
        <ActiveFilterChips
          filters={{
            q: sp.get("q") || "",
            level,
            title,
            national: nationalChurchId,
            district: districtId,
            church: churchId,
          }}
          onClearKey={(key) => update({ [key]: undefined, page: 1 })}
          onClearAll={() =>
            setSp(new URLSearchParams({ page: "1" }), { replace: true })
          }
        />
      </div>

      {/* Table / list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-800/70">
            <tr className="text-left">
              <th className="px-4 py-2">Pastor</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Contacts</th>
              <th className="px-4 py-2 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No pastors found.
                </td>
              </tr>
            )}
            {items.map((p) => {
              const sub = scopeSubtitle(p, { nationalName, districtName, churchName });
              return (
                <tr
                  key={p._id}
                  className="border-t border-slate-200/70 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="px-4 py-3 align-top">
                    <Link className="font-semibold hover:underline" to={`/dashboard/pastors/${p._id}`}>
                      {p.lastName}, {p.firstName}
                    </Link>
                    {sub && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">{p.currentTitle}</td>
                  <td className="px-4 py-3 align-top capitalize">{p.level}</td>
                  <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-300">
                    {[p.email, p.phone].filter(Boolean).join(" • ")}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link className="text-amber-700 hover:underline" to={`/dashboard/pastors/${p._id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/70 dark:border-white/10">
            <div className="text-xs text-slate-500">
              Page {data.page} of {data.pages} • {data.total} total
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => canPrev && update({ page: page - 1 })}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                disabled={!canNext}
                onClick={() => canNext && update({ page: page + 1 })}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Subcomponents & helpers ---------- */

function ActiveFilterChips({
  filters,
  onClearKey,
  onClearAll,
}: {
  filters: {
    q: string;
    level: string;
    title: string;
    national: string;
    district: string;
    church: string;
  };
  onClearKey: (key: string) => void;
  onClearAll: () => void;
}) {
  const chips = useMemo(() => {
    const arr: { key: string; label: string }[] = [];
    if (filters.q) arr.push({ key: "q", label: `Search: ${filters.q}` });
    if (filters.level) arr.push({ key: "level", label: `Level: ${filters.level}` });
    if (filters.title) arr.push({ key: "title", label: `Title: ${filters.title}` });
    if (filters.national) arr.push({ key: "nationalChurchId", label: `National: ${filters.national}` });
    if (filters.district) arr.push({ key: "districtId", label: `District: ${filters.district}` });
    if (filters.church) arr.push({ key: "churchId", label: `Church: ${filters.church}` });
    return arr;
  }, [filters]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-200"
        >
          {c.label}
          <button
            onClick={() => onClearKey(c.key)}
            className="rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-300/10 p-0.5"
            aria-label={`Clear ${c.key}`}
            title={`Clear ${c.key}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="ml-2 text-xs underline text-slate-500 hover:text-slate-700"
      >
        Clear all
      </button>
    </div>
  );
}

function scopeSubtitle(
  p: any,
  fns: {
    nationalName: (id?: string) => string | undefined;
    districtName: (id?: string) => string | undefined;
    churchName: (id?: string) => string | undefined;
  }
) {
  const parts: string[] = [];
  if (p.nationalChurchId) parts.push(fns.nationalName(p.nationalChurchId) || "National");
  if (p.districtId) parts.push(fns.districtName(p.districtId) || "District");
  if (p.churchId) parts.push(fns.churchName(p.churchId) || "Church");
  return parts.length ? parts.join(" • ") : "";
}
