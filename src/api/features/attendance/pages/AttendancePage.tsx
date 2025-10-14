import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Filter, Download, ArrowLeft, Plus, Users,
  Heart, Users2, Zap, Crown, TrendingUp, BarChart3, X
} from "lucide-react";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";
import {
  useAttendance, useAttendanceSummary, useAttendanceDaily, useAttendanceWeekly, useUpsertAttendance
} from "../hooks/useAttendance";
import AttendanceForm from "../components/AttendanceForm";
import AttendanceSummary from "../components/AttendanceSummary";
import AttendanceTable from "../components/AttendanceTable";
import { DailyChart, WeeklyChart } from "../components/AttendanceCharts";
import { attendanceService } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";

const TYPES = ["", "Sunday", "Midweek", "PrayerMeeting", "Vigil", "Conference", "Special", "Other"];

export default function AttendancePage() {
  const navigate = useNavigate();
  const { user, scope } = useAuthStore();
  const isSiteAdmin = user?.role === "siteAdmin";
  const defaultChurchId = scope?.churchId || (user as any)?.churchId || "";

  const [showFormModal, setShowFormModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<{ churchId: string; from: string; to: string; serviceType: string }>({
    churchId: defaultChurchId,
    from: firstDayOfMonth(),
    to: today(),
    serviceType: "",
  });

  const listQuery = useAttendance({ ...filters, page: 1, limit: 200, sort: "-serviceDate" });
  const summaryQuery = useAttendanceSummary({ churchId: filters.churchId, from: filters.from, to: filters.to });
  const dailyQuery = useAttendanceDaily({
    churchId: filters.churchId,
    from: filters.from,
    to: filters.to,
    serviceType: filters.serviceType || undefined,
  });
  const weeklyQuery = useAttendanceWeekly({ churchId: filters.churchId, from: filters.from, to: filters.to });

  const upsert = useUpsertAttendance();

  const handleExport = async () => {
    const blob = await attendanceService.exportCSV({
      churchId: filters.churchId,
      from: filters.from,
      to: filters.to,
      serviceType: filters.serviceType || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${filters.churchId}_${filters.from}_${filters.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableItems = useMemo(() => listQuery.data?.items || [], [listQuery.data]);
  const updateFilter = (key: keyof typeof filters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () =>
    setFilters({ churchId: defaultChurchId, from: firstDayOfMonth(), to: today(), serviceType: "" });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-amber-100/10 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Header / Actions */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Back</span>
            </motion.button>

            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                <Users className="inline-block w-7 h-7 mr-2 -mt-1 text-red-900" />
                Attendance Overview
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Track attendance and gain insights to support your church's growth and engagement.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setDrawerOpen(true)}
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              title="Filters & Stats"
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>

            <motion.button
              onClick={handleExport}
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>

            <motion.button
              onClick={() => setShowFormModal(true)}
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-semibold shadow"
            >
              <Plus className="w-4 h-4" />
              Add Attendance
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-10 pb-20 pt-6">
        {/* Summary Cards */}
        {summaryQuery.data && (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AttendanceSummary totals={summaryQuery.data.totals} />
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <DailyChart data={dailyQuery.data || listQuery.data?.items || []} />
          <WeeklyChart data={weeklyQuery.data || listQuery.data?.items || []} />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AttendanceTable items={tableItems} />
        </motion.div>
      </div>

      {/* Add Attendance Modal */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.92, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <motion.button
                  onClick={() => setShowFormModal(false)}
                  whileHover={{ scale: 0.97 }}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Overview</span>
                </motion.button>
                <h2 className="text-2xl font-serif font-light text-slate-900 dark:text-white">Record Attendance</h2>
                <div className="w-8" />
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <AttendanceForm
                  initial={{ churchId: filters.churchId, serviceDate: filters.to, serviceType: "Sunday" }}
                  onSubmit={(payload) => {
                    upsert.mutate(payload);
                    setShowFormModal(false);
                  }}
                  submitting={upsert.isPending}
                  defaultChurchId={filters.churchId}
                  canChangeChurch={isSiteAdmin}
                  useOrgCascader={isSiteAdmin}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Stats Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Mobile bottom sheet */}
            <motion.aside
              className="fixed inset-x-0 bottom-0 z-[56] lg:hidden bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[82vh] overflow-y-auto p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DrawerContent
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                isSiteAdmin={isSiteAdmin}
                onClose={() => setDrawerOpen(false)}
                summaryTotals={summaryQuery.data?.totals}
              />
            </motion.aside>
            {/* Desktop right drawer */}
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-[56] hidden lg:block w-full max-w-[520px] bg-white dark:bg-slate-900 shadow-2xl p-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DrawerContent
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                isSiteAdmin={isSiteAdmin}
                onClose={() => setDrawerOpen(false)}
                summaryTotals={summaryQuery.data?.totals}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Drawer Content ---------------- */
function DrawerContent({
  filters,
  updateFilter,
  clearFilters,
  isSiteAdmin,
  onClose,
  summaryTotals,
}: {
  filters: { churchId: string; from: string; to: string; serviceType: string };
  updateFilter: (k: keyof typeof filters, v: string) => void;
  clearFilters: () => void;
  isSiteAdmin?: boolean;
  onClose: () => void;
  summaryTotals?: any;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters & Stats</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {!isSiteAdmin ? (
              <ReadOnly label="Church" value={filters.churchId} />
            ) : (
              <Select
                label="Church ID"
                value={filters.churchId}
                onChange={(v) => updateFilter("churchId", v)}
                options={[filters.churchId || "", ""] /* replace with real list when ready */}
              />
            )}
            <DateInput label="From" value={filters.from} onChange={(v) => updateFilter("from", v)} />
            <DateInput label="To" value={filters.to} onChange={(v) => updateFilter("to", v)} />
            <Select
              label="Service Type"
              value={filters.serviceType}
              onChange={(v) => updateFilter("serviceType", v)}
              options={TYPES}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              onClick={clearFilters}
            >
              Clear All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white"
              onClick={onClose}
            >
              Apply
            </motion.button>
          </div>
        </div>

        {/* Mini Summary inside drawer (nice quick glance) */}
        {summaryTotals && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {miniCards(summaryTotals).map((c) => (
              <div
                key={c.key}
                className="rounded-xl p-3 bg-white/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <c.icon className={`w-4 h-4 ${c.color}`} />
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{c.label}</span>
                </div>
                <div className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {Number(c.value || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Small helpers / inputs ---------- */
function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Select({
  label, value, onChange, options
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o, i) => (
          <option key={`${o}-${i}`} value={o}>
            {o || "All"}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="date"
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-slate-600">
        {value || "—"}
      </div>
    </label>
  );
}

/* Mini summary cards config used in the drawer */
function miniCards(totals: any) {
  return [
    { key: "total", label: "Total", value: totals?.total, icon: Calendar, color: "text-blue-500" },
    { key: "services", label: "Services", value: totals?.services, icon: Users, color: "text-green-500" },
    { key: "hel", label: "HEL", value: totals?.holyGhostBaptisms, icon: Heart, color: "text-pink-500" },
    { key: "sou", label: "SOU", value: totals?.newConverts, icon: Users2, color: "text-emerald-500" },
    { key: "firstTimers", label: "First Timers", value: totals?.firstTimers, icon: Zap, color: "text-yellow-500" },
    { key: "newConverts", label: "New Converts", value: totals?.newConverts, icon: Crown, color: "text-purple-500" },
    { key: "hol", label: "HOL", value: totals?.holyGhostBaptisms, icon: TrendingUp, color: "text-indigo-500" },
    { key: "onl", label: "Online", value: totals?.online, icon: BarChart3, color: "text-orange-500" },
  ];
}
