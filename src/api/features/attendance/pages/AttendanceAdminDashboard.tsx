// src/api/features/attendance/pages/AttendanceAdminDashboard.tsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, LayoutGrid, Activity, SwitchCamera, BarChart3, X, Settings,
  Calendar, Heart, Zap, Crown, TrendingUp, Users2, Search
} from "lucide-react";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";
import OrgCascader from "../../../../components/OrgCascader";
import {
  useAttendance, useAttendanceDaily, useAttendanceSummary, useAttendanceWeekly
} from "../hooks/useAttendance";
import {
  useAdminAttendanceSummary, useAdminAttendanceTimeseries, useAdminAttendanceLeaderboard
} from "../hooks/useAttendanceAdmin";
import { DailyChart, WeeklyChart } from "../components/AttendanceCharts";

type ViewMode = "my" | "org";

const GRAD_BORDER = "border-slate-200/70 dark:border-white/10";
const CARD_BG = "bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl";
const SOFT_CARD_BG = "bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm";

export default function AttendanceAdminDashboard() {
  const { user, scope } = useAuthStore();
  const isSiteAdmin = user?.role === "siteAdmin";
  const myChurchId = scope?.churchId || (user as any)?.churchId || "";

  const [mode, setMode] = useState<ViewMode>(isSiteAdmin ? "org" : "my");
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: firstDayOfMonth(),
    to: today(),
  });
  const [orgPick, setOrgPick] = useState<{ nationalId?: string; districtId?: string; churchId?: string }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [q, setQ] = useState(""); // quick filter for leaderboard

  /* -------------------- My Church -------------------- */
  const mySummary = useAttendanceSummary({ churchId: myChurchId, from: range.from, to: range.to });
  const myDaily   = useAttendanceDaily({ churchId: myChurchId, from: range.from, to: range.to });
  const myWeekly  = useAttendanceWeekly({ churchId: myChurchId, from: range.from, to: range.to });
  const myList    = useAttendance({ churchId: myChurchId, from: range.from, to: range.to, page: 1, limit: 200 });

  /* -------------------- Org-wide --------------------- */
  const orgParams  = { ...orgPick, from: range.from, to: range.to };
  const orgSummary = useAdminAttendanceSummary(orgParams);
  const orgDaily   = useAdminAttendanceTimeseries(orgParams);
  const orgLeaders = useAdminAttendanceLeaderboard({ ...orgParams, limit: 50 });

  const dailyData  = mode === "my" ? (myDaily.data || myList.data?.items || []) : (orgDaily.data || []);
  const weeklyData = myWeekly.data || [];

  const summaryData = useMemo(
    () => (mode === "my" ? mySummary.data?.totals : orgSummary.data?.totals),
    [mode, mySummary.data, orgSummary.data]
  );

  const kpis = useMemo(() => ([
    { icon: Calendar, key: "total",         label: "Total Attendance",   value: summaryData?.total || 0,       tone: "text-blue-500"    },
    { icon: Users,    key: "services",      label: "Services",           value: summaryData?.services || 0,    tone: "text-emerald-500" },
    { icon: Heart,    key: "hel",           label: "Holy Ghost Baptism", value: summaryData?.holyGhostBaptisms || 0, tone: "text-pink-500"  },
    { icon: Users2,   key: "firstTimers",   label: "First Timers",       value: summaryData?.firstTimers || 0, tone: "text-yellow-500" },
    { icon: Crown,    key: "newConverts",   label: "New Converts",       value: summaryData?.newConverts || 0, tone: "text-purple-500" },
    { icon: TrendingUp,key: "online",       label: "Online",             value: summaryData?.online || 0,      tone: "text-indigo-500"  },
    { icon: Users2,   key: "men",           label: "Men",                value: summaryData?.men || 0,         tone: "text-slate-500"   },
    { icon: Users2,   key: "women",         label: "Women",              value: summaryData?.women || 0,       tone: "text-slate-500"   },
    { icon: Users2,   key: "children",      label: "Children",           value: summaryData?.children || 0,    tone: "text-slate-500"   },
  ]), [summaryData]);

  const filteredLeaders = useMemo(() => {
    const rows = orgLeaders.data || [];
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => r.churchName?.toLowerCase().includes(s));
  }, [orgLeaders.data, q]);

  return (
    <div className="min-h-screen p-6 space-y-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border ${GRAD_BORDER} ${CARD_BG} px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-9 h-9 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg grid place-items-center"
          >
            <LayoutGrid className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
              Attendance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Daily & weekly trends, KPIs and top churches.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-4 py-2 rounded-full border-2 border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-300 dark:bg-amber-500/10 transition-all inline-flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Filters & Stats
          </button>
          <ModeSwitch mode={mode} onToggle={() => setMode(m => (m === "my" ? "org" : "my"))} />
        </div>
      </motion.div>

      {/* KPI grid */}
      <KpiGrid items={kpis} loading={(!summaryData && (mySummary.isLoading || orgSummary.isLoading))} />

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Attendance" icon={<Activity className="w-5 h-5 text-blue-500" />}>
          {(!dailyData || (mode === "my" ? myDaily.isLoading : orgDaily.isLoading)) ? (
            <ChartSkeleton />
          ) : (
            <DailyChart data={dailyData as any[]} />
          )}
        </ChartCard>
        <ChartCard title="Weekly Overview" icon={<BarChart3 className="w-5 h-5 text-emerald-500" />}>
          {myWeekly.isLoading ? <ChartSkeleton /> : <WeeklyChart data={weeklyData as any[]} />}
        </ChartCard>
      </div>

      {/* Leaderboard (org view only) */}
      {mode === "org" && isSiteAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border ${GRAD_BORDER} ${SOFT_CARD_BG} shadow-lg p-5`}
        >
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-amber-600" />
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Top Churches (by total attendance)</div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search church…"
                className="pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
              />
            </div>
          </div>

          <div className={`overflow-hidden rounded-xl border ${GRAD_BORDER}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50/70 dark:bg-slate-800/50 sticky top-0 z-10 text-slate-600">
                  <tr className="divide-x divide-slate-200 dark:divide-slate-700">
                    <Th>Church</Th>
                    <Th align="right">Total</Th>
                    <Th align="right" className="hidden sm:table-cell">Services</Th>
                    <Th align="right" className="hidden md:table-cell">First Timers</Th>
                    <Th align="right" className="hidden md:table-cell">New Converts</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {orgLeaders.isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredLeaders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No data for this range.</td>
                    </tr>
                  ) : (
                    filteredLeaders.map((r, i) => (
                      <motion.tr
                        key={r._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.02 }}
                        className={`divide-x divide-slate-100 dark:divide-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          i % 2 === 0 ? "bg-white/70 dark:bg-slate-900/30" : ""
                        }`}
                      >
                        <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{r.churchName}</td>
                        <td className="px-6 py-3 text-right tabular-nums font-bold text-amber-600">{r.total.toLocaleString()}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400 hidden sm:table-cell">{r.services}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-emerald-600 hidden md:table-cell">{r.firstTimers}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-purple-600 hidden md:table-cell">{r.newConverts}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto rounded-l-2xl"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters & Stats</h2>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode + Dates */}
                <div className="flex items-center justify-between gap-3">
                  <ModeSwitch mode={mode} onToggle={() => setMode(m => (m === "my" ? "org" : "my"))} />
                  <div className="grid grid-cols-2 gap-3">
                    <DateInput label="From" value={range.from} onChange={(v) => setRange(p => ({ ...p, from: v }))} />
                    <DateInput label="To"   value={range.to}   onChange={(v) => setRange(p => ({ ...p, to: v }))} />
                  </div>
                </div>

                {/* Org pick */}
                {mode === "org" && isSiteAdmin && <OrgCascader value={orgPick} onChange={setOrgPick} />}

                {/* KPI preview in drawer */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {kpis.map((k, i) => (
                    <motion.div
                      key={k.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`rounded-xl border ${GRAD_BORDER} ${SOFT_CARD_BG} p-3 text-center`}
                    >
                      <div className={`mx-auto mb-1 w-8 h-8 rounded-lg grid place-items-center ${k.tone} bg-white/80 dark:bg-slate-700/50`}>
                        <k.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
                        {k.value.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{k.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- UI bits -------------------- */

function ModeSwitch({ mode, onToggle }: { mode: ViewMode; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-400/30 px-2 py-1">
      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${mode === "my" ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "text-slate-500"}`}>
        My Church
      </span>
      <button
        onClick={onToggle}
        className="text-xs sm:text-sm px-3 py-1 rounded-full border-2 border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-300 dark:bg-amber-500/10 transition"
        title="Switch view"
      >
        <span className="hidden sm:inline">Switch</span>
        <span className="sm:hidden">↔</span>
      </button>
      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${mode === "org" ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "text-slate-500"}`}>
        Organization
      </span>
    </div>
  );
}

function KpiGrid({ items, loading }: { items: Array<{ icon: any; key: string; label: string; value: number; tone: string }>; loading?: boolean }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3`}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
        : items.map((k) => (
            <motion.div
              key={k.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${GRAD_BORDER} ${CARD_BG} p-4 shadow-sm hover:shadow transition`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg grid place-items-center ${k.tone} bg-gradient-to-r from-white to-slate-100 dark:from-slate-700 dark:to-slate-600`}>
                  <k.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{k.label}</div>
                  <div className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">{k.value.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border ${GRAD_BORDER} ${SOFT_CARD_BG} p-6 shadow-lg`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Th({ children, align = "left", className = "" }: { children: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th className={`px-6 py-3 font-semibold ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </th>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[260px] w-full grid gap-3 content-end">
      <div className="h-40 w-full rounded-lg bg-slate-100 dark:bg-white/10 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="divide-x divide-slate-100 dark:divide-white/5">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-3 w-32 max-w-full rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function KpiSkeleton() {
  return (
    <div className={`rounded-xl border ${GRAD_BORDER} ${CARD_BG} p-4`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 animate-pulse" />
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
          <div className="mt-2 h-4 w-24 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
      />
    </label>
  );
}

/* -------------------- utils -------------------- */
function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
