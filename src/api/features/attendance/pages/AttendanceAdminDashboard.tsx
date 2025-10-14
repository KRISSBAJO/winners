import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, LayoutGrid, Activity, SwitchCamera, BarChart3, X, Settings, Calendar, Heart, Zap, Crown, TrendingUp, Users2 } from "lucide-react";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";
import OrgCascader from "../../../../components/OrgCascader";
import { useAttendance, useAttendanceDaily, useAttendanceSummary, useAttendanceWeekly } from "../hooks/useAttendance";
import { useAdminAttendanceSummary, useAdminAttendanceTimeseries, useAdminAttendanceLeaderboard } from "../hooks/useAttendanceAdmin";
import { DailyChart, WeeklyChart } from "../components/AttendanceCharts";

type ViewMode = "my" | "org";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
};

const iconColors = {
  calendar: "text-blue-500",
  users: "text-green-500",
  heart: "text-pink-500",
  zap: "text-yellow-500",
  crown: "text-purple-500",
  trendingUp: "text-indigo-500",
  barChart: "text-orange-500",
  building2: "text-gray-500"
};

export default function AttendanceAdminDashboard() {
  const { user, scope } = useAuthStore();
  const isSiteAdmin = user?.role === "siteAdmin";

  const myChurchId = scope?.churchId || (user as any)?.churchId || "";

  const [mode, setMode] = useState<ViewMode>(isSiteAdmin ? "org" : "my");
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: firstDayOfMonth(),
    to: today(),
  });

  // Org selection (only in org mode)
  const [orgPick, setOrgPick] = useState<{ nationalId?: string; districtId?: string; churchId?: string }>({});

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* -------------------- My Church queries -------------------- */
  const mySummary = useAttendanceSummary({ churchId: myChurchId, from: range.from, to: range.to });
  const myDaily = useAttendanceDaily({ churchId: myChurchId, from: range.from, to: range.to });
  const myWeekly = useAttendanceWeekly({ churchId: myChurchId, from: range.from, to: range.to });
  const myList = useAttendance({ churchId: myChurchId, from: range.from, to: range.to, page: 1, limit: 200 });

  /* -------------------- Org-wide queries -------------------- */
  const orgParams = { ...orgPick, from: range.from, to: range.to };
  const orgSummary = useAdminAttendanceSummary(orgParams);
  const orgDaily = useAdminAttendanceTimeseries(orgParams);
  const orgLeaders = useAdminAttendanceLeaderboard({ ...orgParams, limit: 10 });

  // fallbacks so charts don’t look empty in edge cases
  const dailyData = mode === "my" ? (myDaily.data || myList.data?.items || []) : (orgDaily.data || []);
  const weeklyData = myWeekly.data || []; // we didn’t build org weekly; keep the my-week chart for now

  const summaryData = useMemo(() => 
    mode === "my" ? mySummary.data?.totals : orgSummary.data?.totals, 
    [mode, mySummary.data, orgSummary.data]
  );

  const cardsConfig = useMemo(() => [
    { icon: Calendar, key: 'total', label: 'Total Attendance', value: summaryData?.total || 0, color: iconColors.calendar },
    { icon: Users, key: 'services', label: 'Services', value: summaryData?.services || 0, color: iconColors.users },
    { icon: Heart, key: 'hel', label: 'HEL', value: summaryData?.holyGhostBaptisms || 0, color: iconColors.heart },
    { icon: Users2, key: 'sou', label: 'SOU', value: summaryData?.newConverts || 0, color: iconColors.users },
    { icon: Users2, key: 'men', label: 'MEN', value: summaryData?.men || 0, color: iconColors.users },
    { icon: Users2, key: 'wom', label: 'WOM', value: summaryData?.women || 0, color: iconColors.users },
    { icon: Users2, key: 'chi', label: 'CHI', value: summaryData?.children || 0, color: iconColors.users },
    { icon: Zap, key: 'firstTimers', label: 'First Timers', value: summaryData?.firstTimers || 0, color: iconColors.zap },
    { icon: Crown, key: 'newConverts', label: 'New Converts', value: summaryData?.newConverts || 0, color: iconColors.crown },
    { icon: TrendingUp, key: 'hol', label: 'HOL', value: summaryData?.holyGhostBaptisms || 0, color: iconColors.trendingUp },
    { icon: BarChart3, key: 'onl', label: 'ONL', value: summaryData?.online || 0, color: iconColors.barChart },
    { icon: Users, key: 'ush', label: 'USH', value: summaryData?.ushers || 0, color: iconColors.users },
    { icon: Building2, key: 'cho', label: 'CHO', value: summaryData?.choir || 0, color: iconColors.building2 }
  ], [summaryData]);

  return (
    <div className="space-y-8 p-4 bg-white dark:from-slate-950 to-slate-900 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
          >
            <LayoutGrid className="w-5 h-5 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Attendance Analytics
          </h1>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 rounded-full border-2 border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:bg-amber-500/10 transition-all duration-200 inline-flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Filters & Stats
        </button>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Daily Attendance</h2>
          </div>
          <DailyChart data={dailyData as any[]} />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Weekly Overview</h2>
          </div>
          <WeeklyChart data={weeklyData as any[]} />
        </motion.div>
      </div>

      {/* Org leaderboard */}
      {mode === "org" && isSiteAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-amber-600" />
            <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">Top Churches (by total attendance)</div>
          </div>
          <OrgLeaderboard rows={orgLeaders.data || []} />
        </motion.div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto rounded-l-2xl lg:rounded-none"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters & Stats</h2>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 bg-white/50 dark:bg-slate-800/50 rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className={`text-sm font-medium ${mode === "my" ? "text-amber-600" : "text-slate-500"}`}>My Church</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMode(prev => prev === "my" ? "org" : "my")}
                      className="px-4 py-2 rounded-full border-2 border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:bg-amber-500/10 transition-all duration-200 inline-flex items-center gap-2"
                      title="Switch view"
                    >
                      <SwitchCamera className="w-4 h-4" />
                      <span>{mode === "my" ? "Org View" : "My View"}</span>
                    </motion.button>
                    <span className={`text-sm font-medium ${mode === "org" ? "text-amber-600" : "text-slate-500"}`}>Organization</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateInput 
                      label="From" 
                      value={range.from} 
                      onChange={(v) => setRange(p => ({ ...p, from: v }))} 
                    />
                    <DateInput 
                      label="To" 
                      value={range.to} 
                      onChange={(v) => setRange(p => ({ ...p, to: v }))} 
                    />
                  </div>

                  {mode === "org" && isSiteAdmin && (
                    <OrgCascader value={orgPick} onChange={setOrgPick} />
                  )}

                  {/* Summary Cards in Drawer */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cardsConfig.map((card, i) => (
                      <motion.div
                        key={card.key}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        className="group relative rounded-xl p-3 bg-white/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center space-y-1 text-center">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-white to-slate-100 dark:from-slate-700 dark:to-slate-600 shadow-sm ${card.color}`}
                          >
                            <card.icon className="w-4 h-4 text-white" />
                          </motion.div>
                          <div className="font-bold text-base text-slate-800 dark:text-slate-100 tabular-nums">
                            {card.value.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {card.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- small UI bits ---------------- */
function OrgLeaderboard({ rows }: { rows: Array<{ _id: string; churchName: string; total: number; services: number; firstTimers: number; newConverts: number; }> }) {
  if (!rows.length) return <div className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No data for this range.</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-700/50">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 z-10">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-300">Church</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">Total</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">Services</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">First Timers</th>
            <th className="py-3 px-4 text-right font-semibold text-slate-600 dark:text-slate-300">New Converts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr 
              key={r._id} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">{r.churchName}</td>
              <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-600">{r.total.toLocaleString()}</td>
              <td className="py-3 px-4 text-right tabular-nums text-slate-600 dark:text-slate-400">{r.services}</td>
              <td className="py-3 px-4 text-right tabular-nums text-green-600">{r.firstTimers}</td>
              <td className="py-3 px-4 text-right tabular-nums text-purple-600">{r.newConverts}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type="date"
        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ChurchInput({ label, value }: { label: string; value: string; }) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400">
        {value || "—"}
      </div>
    </label>
  );
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}