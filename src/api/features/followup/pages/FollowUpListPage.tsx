// src/api/features/followup/pages/FollowUpListPage.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Users, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useFollowupList, useFollowupStats } from "../hooks/useFollowup";
import { BRAND_RED, BRAND_GOLD } from "../ui/theme";

const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

export default function FollowUpListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");

  const { data, isLoading } = useFollowupList({
    q, status, type, page: 1, limit: 50, sort: "recent",
  });
  const stats = useFollowupStats();

  const items = data?.items || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            Follow-Up
          </h1>
          <p className="text-sm text-slate-500">Manage newcomer care, absentees, evangelism and more.</p>
        </div>

        <Link
          to="/dashboard/followup/open"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md hover:brightness-105 transition"
          style={{ background: GRADIENT }}
        >
          <Plus size={16} /> Open Case
        </Link>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Open"        value={stats.data?.open ?? 0} />
        <StatCard label="In Progress" value={stats.data?.inProgress ?? 0} />
        <StatCard label="Paused"      value={stats.data?.paused ?? 0} />
        <StatCard label="Resolved"    value={stats.data?.resolved ?? 0} />
      </div>

      {/* Controls + Table */}
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg bg-white/95 dark:bg-slate-800/70"
              placeholder="Search name, email, phone, reason…"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              className="border rounded-lg px-3 py-2 bg-white/95 dark:bg-slate-800/70"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2 bg-white/95 dark:bg-slate-800/70"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All types</option>
              <option value="newcomer">Newcomer</option>
              <option value="absentee">Absentee</option>
              <option value="evangelism">Evangelism</option>
              <option value="care">Care</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 sticky top-0 z-10 shadow-sm">
                <tr className="divide-x divide-slate-200 dark:divide-slate-700">
                  <Th>Person</Th>
                  <Th className="hidden md:table-cell">Type</Th>
                  <Th>Status</Th>
                  <Th className="hidden sm:table-cell">Score</Th>
                  <Th className="hidden lg:table-cell">Tags</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {/* Loading skeleton */}
                <AnimatePresence initial={false}>
                  {isLoading &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonRow key={i} delay={i * 0.05} />
                    ))}
                </AnimatePresence>

                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10">
                      <EmptyState />
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  items.map((c: any, i: number) => {
                    const personName =
                      c.memberId && typeof c.memberId !== "string"
                        ? `${c.memberId.firstName} ${c.memberId.lastName}`
                        : c.prospect
                        ? `${c.prospect.firstName} ${c.prospect.lastName ?? ""}`
                        : "—";

                    const email =
                      c.prospect?.email ||
                      (typeof c.memberId !== "string" ? c.memberId?.email : "");

                    return (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.02 }}
                        className={`divide-x divide-slate-100 dark:divide-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          i % 2 === 0 ? "bg-white/70 dark:bg-slate-900/30" : ""
                        }`}
                      >
                        {/* Person */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {personName}
                          </div>
                          {email && (
                            <div className="text-[11px] text-slate-500 truncate max-w-[22ch]">
                              {email}
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 hidden md:table-cell">
                          <TypePill value={c.type} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge value={c.status} />
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <Score value={c.engagementScore} />
                        </td>

                        {/* Tags */}
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            {(c.tags || []).map((t: string) => (
                              <span
                                key={t}
                                className="text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300/90"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Link
                              to={`/dashboard/followup/${c._id}`}
                              className="px-3 py-1.5 rounded-md border text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/10 hover:bg-white shadow-sm"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Subcomponents -------------------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-white/10 p-4 bg-white/90 dark:bg-slate-900/70">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 font-semibold ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </th>
  );
}

function TypePill({ value }: { value?: string }) {
  if (!value) return <span>—</span>;
  const map: Record<string, string> = {
    newcomer: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    absentee: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
    evangelism: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    care: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  };
  const cls = map[value] || "bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span>—</span>;
  const map: Record<string, string> = {
    open: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
    in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    paused: "bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-slate-300",
    resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    archived: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400",
  };
  const label = value.replace("_", " ");
  const cls = map[value] || map.paused;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function Score({ value = 0 }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-40 max-w-full">
      <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              pct >= 70
                ? "linear-gradient(135deg,#22c55e,#86efac)"
                : pct >= 40
                ? "linear-gradient(135deg,#f59e0b,#fde68a)"
                : "linear-gradient(135deg,#ef4444,#fecaca)",
          }}
        />
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{pct}%</div>
    </div>
  );
}

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="divide-x divide-slate-100 dark:divide-white/5"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-40 max-w-full rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        </td>
      ))}
    </motion.tr>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-white/10 grid place-items-center">
        <Users className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-800 dark:text-slate-200">No cases found</h3>
      <p className="text-sm text-slate-500 mt-1">
        Adjust filters or create a new follow-up case to get started.
      </p>
      <Link
        to="/dashboard/followup/open"
        className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-white shadow"
        style={{ background: GRADIENT }}
      >
        <Plus size={16} /> Open Case
      </Link>
    </div>
  );
}
