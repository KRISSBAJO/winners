import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivityInfinite } from "..//hooks/useActivity";
import type { ActivityItem } from "..//types/activityTypes";
import {
  CalendarPlus, CalendarCheck2, MessageSquare, UserPlus, Users, ListChecks, Filter, Loader2
} from "lucide-react";

/* ===== Brand ===== */
const BRAND_GRAD = "linear-gradient(135deg,#0B1B45,#D4AF37)";
const GOLD = "#D4AF37";
const NAVY = "#0B1B45";

/* ===== Page ===== */
export default function ActivityPage() {
  const limit = 30;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivityInfinite(limit);

  // Flatten pages
  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data]
  );

  // Filters (UI only for now; wire to API when ready)
  const [activeFilter, setActiveFilter] = useState<"All" | "Events" | "Members" | "Attendance">("All");
  const filtered = useMemo(() => {
    if (activeFilter === "All") return items;
    if (activeFilter === "Events") return items.filter(i => i.kind.startsWith("event."));
    if (activeFilter === "Members") return items.filter(i => i.kind.startsWith("member."));
    return items.filter(i => i.kind.startsWith("attendance."));
  }, [items, activeFilter]);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="relative min-h-screen">
      {/* Decorative brand gradient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30"
             style={{ background: BRAND_GRAD }} />
        <div className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20"
             style={{ background: BRAND_GRAD }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10 bg-white/70 dark:bg-slate-950/50">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-gradient-to-br from-[#0B1B45] to-[#D4AF37]" />
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Activity
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organization-wide updates across events, members, and attendance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5
                           bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 transition"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(["All", "Events", "Members", "Attendance"] as const).map((lbl) => {
              const active = activeFilter === lbl;
              return (
                <motion.button
                  key={lbl}
                  onClick={() => setActiveFilter(lbl)}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3 py-1.5 text-sm rounded-full transition
                    ${active
                      ? "text-white shadow-sm"
                      : "border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  style={active ? { background: BRAND_GRAD } : undefined}
                >
                  {lbl}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Summary strip */}
        <SummaryStrip total={items.length} filtered={filtered.length} loading={isLoading} />

        {/* Feed */}
        {isLoading ? <SkeletonList /> : null}
        {!isLoading && !filtered.length ? <EmptyState /> : null}

        <ul className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => (
              <motion.li
                key={a._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ActivityCard item={a} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {/* Infinite sentinel */}
        {hasNextPage && (
          <div ref={sentinelRef} className="h-14 flex items-center justify-center">
            {isFetchingNextPage && <Spinner />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Card ===== */
function ActivityCard({ item }: { item: ActivityItem }) {
  const icon = iconByKind(item.kind);
  const color = colorByKind(item.kind);
  const [showMeta, setShowMeta] = useState(false);

  const onToggle = useCallback(() => setShowMeta(v => !v), []);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative rounded-2xl border border-slate-200/60 dark:border-white/10
                 bg-white/90 dark:bg-slate-900/70 overflow-hidden"
    >
      {/* Accent bar */}
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: BRAND_GRAD }} />

      {/* Top row */}
      <div className="pl-3 pr-3">
        <div className="flex items-start gap-3 p-4">
          <div
            className="shrink-0 rounded-xl p-2 border shadow-sm"
            style={{ borderColor: `${color}33`, background: `${color}10` }}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] leading-5 text-slate-800 dark:text-slate-100">
                <span className="font-semibold">{item.actorName || "Someone"}</span>{" "}
                {item.verb}
                {item.target?.name && (
                  <>
                    {" "}
                    <span className="font-medium text-slate-900 dark:text-white">“{item.target.name}”</span>
                  </>
                )}
              </p>
              <Badge kind={item.kind} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <TimeBadge iso={item.createdAt} />
              {item.target?.type && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5">
                  <span className="opacity-70">Target:</span> {item.target.type}
                </span>
              )}
              {item.meta ? (
                <button
                  onClick={onToggle}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  Details
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Collapsible meta */}
        <AnimatePresence initial={false}>
          {showMeta && item.meta && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-4 mb-4 overflow-hidden"
            >
              <pre className="text-xs bg-black/5 dark:bg-white/5 p-3 rounded-xl overflow-x-auto">
                {JSON.stringify(item.meta, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ===== Bits ===== */
function Badge({ kind }: { kind: ActivityItem["kind"] }) {
  const label =
    kind.startsWith("event.") ? "Event" :
    kind.startsWith("member.") ? "Member" :
    kind.startsWith("attendance.") ? "Attendance" : "Activity";
  return (
    <span
      className="shrink-0 text-[10px] uppercase tracking-wide rounded-md px-2 py-1 border"
      style={{
        color: NAVY,
        borderColor: "#0B1B4522",
        background: "#0B1B450D",
      }}
    >
      {label}
    </span>
  );
}

function TimeBadge({ iso }: { iso: string | Date }) {
  const d = new Date(iso);
  const pretty = d.toLocaleString();
  const rel = timeAgo(d);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
      <span title={pretty}>{rel}</span>
    </span>
  );
}

/* ===== Helpers ===== */
function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString();
}

function iconByKind(kind: ActivityItem["kind"]) {
  const cls = "w-4 h-4";
  switch (kind) {
    case "event.created":   return <CalendarPlus className={cls} />;
    case "event.updated":   return <CalendarCheck2 className={cls} />;
    case "event.commented": return <MessageSquare className={cls} />;
    case "attendance.upserted": return <ListChecks className={cls} />;
    case "member.created":  return <UserPlus className={cls} />;
    case "member.updated":  return <Users className={cls} />;
    default:                return <MessageSquare className={cls} />;
  }
}

function colorByKind(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "event.created": return GOLD;
    case "event.updated": return "#40C7A5";
    case "event.commented": return "#8A8AFF";
    case "attendance.upserted": return "#FFB020";
    case "member.created": return "#22A3FF";
    case "member.updated": return "#8B5CF6";
    default: return "#94A3B8";
  }
}

/* ===== UI Bits ===== */
function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="relative">
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: BRAND_GRAD }} />
          <div className="rounded-2xl h-24 animate-pulse bg-slate-200/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-white/10" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center
                    border-slate-300 dark:border-white/10 bg-white/60 dark:bg-slate-900/50">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        No recent activity yet. Create events, add members, or record attendance to see updates here.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <Loader2 className="w-5 h-5 animate-spin" />
      Loading…
    </div>
  );
}

function SummaryStrip({ total, filtered, loading }: { total: number; filtered: number; loading: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard label="Total Items" value={loading ? "—" : total.toLocaleString()} />
      <StatCard label="Visible" value={loading ? "—" : filtered.toLocaleString()} />
      <StatCard label="Brand" value="Deep Navy · Gold" />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
