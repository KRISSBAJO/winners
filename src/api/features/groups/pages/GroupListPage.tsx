// src/api/features/groups/pages/GroupListPage.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useGroups, useDeleteGroup } from "../hooks/useGroups";
import type { Group, GroupType } from "../types/groupTypes";
import OrgCascader, { ScopeValue } from "../../../../components/OrgCascader";
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Rows as DensityIcon,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* Small debounce hook */
function useDebounce<T>(val: T, ms = 300) {
  const [v, setV] = useState(val);
  useEffect(() => {
    const id = setTimeout(() => setV(val), ms);
    return () => clearTimeout(id);
  }, [val, ms]);
  return v;
}

const TYPES = ["cell","ministry","class","prayer","outreach","youth","women","men","seniors","other"] as const;

type SortKey = "name" | "recent";

export default function GroupListPage() {
  /* ---------- filters ---------- */
  const [scope, setScope] = useState<ScopeValue>({});
  const [q, setQ] = useState("");
  const [type, setType] = useState<GroupType | "">("");
  const [visibility, setVisibility] = useState<string>("");
  const [isActive, setIsActive] = useState<string>(""); // "", "true", "false"
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<SortKey>("name");
  const [dense, setDense] = useState(false); // density toggle

  const dq = useDebounce(q, 350);

  const params = useMemo(
    () => ({
      page,
      limit,
      sort,                              // backend supports: "recent" | "name"
      q: dq || undefined,
      type: (type as GroupType) || undefined,
      visibility: visibility || undefined, // backend ignores if not supported
      isActive: isActive === "" ? undefined : isActive === "true", // ✅ boolean coercion
      nationalChurchId: scope.nationalId || undefined,
      districtId: scope.districtId || undefined,
      churchId: scope.churchId || undefined,
    }),
    [page, limit, sort, dq, type, visibility, isActive, scope.nationalId, scope.districtId, scope.churchId]
  );

  const { data, isLoading, isFetching } = useGroups(params);
  const del = useDeleteGroup();

  /* when scope or filters change, reset to first page */
  useEffect(() => {
    setPage(1);
  }, [dq, type, visibility, isActive, scope, sort, limit]);

  /* ---------- helpers ---------- */
  const exportCSV = () => {
    const items = data?.items ?? [];
    const rows = items.map((g) => ({
      Name: g.name,
      Subtitle: g.subtitle ?? "",
      Type: g.type,
      Visibility: g.visibility ?? "members",
      JoinPolicy: g.joinPolicy ?? "request",
      Active: g.isActive ? "Yes" : "No",
      Area: g.publicArea ?? "",
      Capacity: typeof g.capacity === "number" ? String(g.capacity) : "",
    }));
    const header = Object.keys(rows[0] ?? {
      Name: "", Subtitle: "", Type: "", Visibility: "", JoinPolicy: "", Active: "", Area: "", Capacity: "",
    });
    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((r) =>
          header.map((h) => csvEscape((r as any)[h] ?? "")).join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `groups_page${data?.page ?? 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Groups</h1>
          <p className="text-sm text-slate-500">Manage fellowships, ministries, and circles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDense((d) => !d)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            title={dense ? "Comfortable density" : "Compact density"}
          >
            <DensityIcon className="h-4 w-4" />
            {dense ? "Comfortable" : "Compact"}
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            title="Export current page to CSV"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/dashboard/admin/groups/new"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md hover:brightness-110"
            style={{ background: GRADIENT }}
          >
            <Plus className="h-4 w-4" />
            New Group
          </Link>
        </div>
      </div>

      {/* Scope filter */}
      <OrgCascader value={scope} onChange={setScope} className="mb-4" />

      {/* Toolbar */}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="col-span-1 md:col-span-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-9 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
              placeholder="Search name, subtitle, tags…"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-4 gap-2">
          <div className="relative col-span-2">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GroupType | "")}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-9 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
            >
              <option value="">All Types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
            >
              <option value="">Visibility</option>
              <option value="public">public</option>
              <option value="members">members</option>
              <option value="private">private</option>
            </select>
          </div>

          <div>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
            >
              <option value="">Status</option>
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-3 gap-2 md:justify-end">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
            title="Sort order"
          >
            <option value="name">Sort: name (A→Z)</option>
            <option value="recent">Sort: recent</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
          >
            {[10,20,50,100].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <div className="hidden md:flex items-center justify-end gap-2">
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          </div>
        </div>
      </div>

      {/* ----- Mobile cards (<= md) ----- */}
      <ul className="md:hidden grid gap-3">
        {(isLoading ? Array.from({ length: limit }) : (data?.items ?? [])).map((g, i) =>
          isLoading ? (
            <li key={`sk-${i}`} className="rounded-xl border bg-white p-4">
              <div className="h-4 w-1/3 bg-slate-100 rounded mb-2 animate-pulse" />
              <div className="h-3 w-2/3 bg-slate-100 rounded mb-1 animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
            </li>
          ) : (
            <li key={(g as Group)._id} className="rounded-xl border bg-white p-3">
              <div className="flex items-center gap-3">
                {(g as Group).coverUrl ? (
                  <img
                    src={(g as Group).coverUrl}
                    alt={(g as Group).name}
                    className="h-12 w-16 rounded object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-12 w-16 rounded bg-slate-100 ring-1 ring-slate-200" />
                )}
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{(g as Group).name}</div>
                  <div className="text-xs text-slate-500 capitalize">{(g as Group).type}</div>
                </div>
                <Link
                  to={`/dashboard/admin/groups/${(g as Group)._id}/manage`}
                  className="ml-auto rounded-md border px-2 py-1 text-xs"
                >
                  Manage
                </Link>
              </div>
            </li>
          )
        )}
      </ul>

      {/* ----- Desktop table (>= md) ----- */}
      <div className="hidden md:block overflow-auto rounded-xl border bg-white">
        <div className="min-w-[880px]">
          <table className={`w-full text-sm ${dense ? "leading-tight" : "leading-normal"}`}>
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur border-b">
              <tr>
                <Th>Name</Th>
                <Th>
                  <div className="inline-flex items-center gap-1">
                    Type
                    {/* simple visual caret for sort = name/recent only */}
                    {sort === "name" ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : null}
                  </div>
                </Th>
                <Th>Visibility</Th>
                <Th>Join</Th>
                <Th className="text-center">Active</Th>
                <Th className="w-40 text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading
                ? Array.from({ length: limit }).map((_, i) => (
                    <tr key={`sk-${i}`} className="bg-white/60">
                      <SkTd colSpan={6} />
                    </tr>
                  ))
                : (data?.items ?? []).map((g) => (
                    <tr key={g._id} className="hover:bg-amber-50/40">
                      <Td>
                        <div className="flex items-center gap-3">
                          {g.coverUrl ? (
                            <img
                              src={g.coverUrl}
                              alt={g.name}
                              className={`h-8 w-12 rounded object-cover ring-1 ring-slate-200 ${dense ? "h-7 w-10" : ""}`}
                            />
                          ) : (
                            <div className={`rounded bg-slate-100 ring-1 ring-slate-200 ${dense ? "h-7 w-10" : "h-8 w-12"}`} />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">{g.name}</div>
                            {g.subtitle && (
                              <div className="text-xs text-slate-500 truncate">{g.subtitle}</div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td className="capitalize">{g.type}</Td>
                      <Td>{g.visibility ?? "members"}</Td>
                      <Td>{g.joinPolicy ?? "request"}</Td>
                      <Td className="text-center">
                        {g.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <XCircle className="h-4 w-4" /> No
                          </span>
                        )}
                      </Td>
                      <Td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/dashboard/admin/groups/${g._id}/manage`}
                            className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                            title="Manage occurrences & join requests"
                          >
                            Manage
                          </Link>
                          <Link
                            to={`/dashboard/admin/groups/${g._id}/edit`}
                            className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <button
                            className="rounded-md border px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                            disabled={del.isPending}
                            onClick={async () => {
                              if (confirm(`Delete "${g.name}"?`)) {
                                await del.mutateAsync(g._id);
                              }
                            }}
                          >
                            Delete
                          </button>
                          <button
                            className="rounded-md border p-1 hover:bg-slate-50"
                            title="More"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
              {!isLoading && (data?.items?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {data ? `Page ${data.page} of ${data.pages} • ${data.total} total` : "—"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => (data?.pages ? Math.min(data.pages, p + 1) : p + 1))}
            disabled={(!!data && page >= (data.pages || 1)) || isFetching}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helpers */
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2 text-left text-[13px] font-semibold text-slate-600 ${className}`}
      style={{ whiteSpace: "nowrap" }}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 ${className} ${/* denser vertical rhythm via parent prop */ ""}`}>{children}</td>;
}

/* Skeleton cell for loading rows */
function SkTd({ colSpan }: { colSpan: number }) {
  return (
    <td colSpan={colSpan} className="p-3">
      <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
    </td>
  );
}

/* CSV escape helper */
function csvEscape(v: string) {
  const needsQuotes = /[",\n]/.test(v);
  const s = String(v).replace(/"/g, '""');
  return needsQuotes ? `"${s}"` : s;
}
