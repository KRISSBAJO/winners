import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Upload, Download, ArrowLeft, Plus, Users, Heart, Users2, Zap, Crown, TrendingUp, BarChart3 } from "lucide-react";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";
import { useAttendance, useAttendanceSummary, useAttendanceDaily, useAttendanceWeekly, useUpsertAttendance } from "../hooks/useAttendance";
import AttendanceForm from "../components/AttendanceForm";
import AttendanceSummary from "../components/AttendanceSummary";
import AttendanceTable from "../components/AttendanceTable";
import { DailyChart, WeeklyChart } from "../components/AttendanceCharts";
import { attendanceService } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";

const TYPES = ["", "Sunday","Midweek","PrayerMeeting","Vigil","Conference","Special","Other"];

export default function AttendancePage() {
  const navigate = useNavigate();
  const { user, scope } = useAuthStore();
  const isSiteAdmin = user?.role === "siteAdmin";
  const defaultChurchId = scope?.churchId || (user as any)?.churchId || "";
  const [showFormModal, setShowFormModal] = useState(false);

  const [filters, setFilters] = useState<{ churchId: string; from: string; to: string; serviceType: string }>({
    churchId: defaultChurchId,
    from: firstDayOfMonth(),
    to: today(),
    serviceType: "",
  });

  const listQuery = useAttendance({ ...filters, page: 1, limit: 200, sort: "-serviceDate" });
  const summaryQuery = useAttendanceSummary({ churchId: filters.churchId, from: filters.from, to: filters.to });
  const dailyQuery = useAttendanceDaily({ churchId: filters.churchId, from: filters.from, to: filters.to, serviceType: filters.serviceType || undefined });
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

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      churchId: defaultChurchId,
      from: firstDayOfMonth(),
      to: today(),
      serviceType: "",
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-amber-100/10 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-amber-400/20 transition-all duration-300"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Back</span>
      </motion.button>

      <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <Users className="inline-block w-8 h-8 mr-2 -mt-1 text-red-900" />
            Attendance Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track attendance and gain insights to support your church's growth and engagement.
          </p>
        </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-8 pb-20">
        {/* Filters */}
        <motion.div
          className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 py-6 rounded-3xl shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4 ">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
            >
              Clear All
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs p-2">
            {!isSiteAdmin ? (
              <ReadOnly label="Church" value={filters.churchId} />
            ) : (
              <Select
                label="Church ID"
                value={filters.churchId}
                onChange={(v) => updateFilter("churchId", v)}
                options={[ defaultChurchId]} 
              />
            )}
            <DateInput
              label="From"
              value={filters.from}
              onChange={(v) => updateFilter("from", v)}
            />
            <DateInput
              label="To"
              value={filters.to}
              onChange={(v) => updateFilter("to", v)}
            />
            <Select
              label="Service Type"
              value={filters.serviceType}
              onChange={(v) => updateFilter("serviceType", v)}
              options={TYPES}
            />
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Apply
              </motion.button>
            </div>
          </div>
        </motion.div>

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
          <DailyChart  data={dailyQuery.data  || listQuery.data?.items || []} />
          <WeeklyChart data={weeklyQuery.data || listQuery.data?.items || []} />
        </motion.div>

        {/* Add Attendance Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            onClick={() => setShowFormModal(true)}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-semibold shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add Attendance
          </motion.button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AttendanceTable items={tableItems} />
        </motion.div>

        {/* Export Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            onClick={handleExport}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-600 text-white font-semibold shadow-lg hover:shadow-slate-500/30 transition-all"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </motion.button>
        </motion.div>
      </div>

      {/* Add Attendance Modal */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <motion.button
                  onClick={() => setShowFormModal(false)}
                  whileHover={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Overview</span>
                </motion.button>
                <h2 className="text-2xl font-serif font-light text-slate-900 dark:text-white">Record Attendance</h2>
                <div className="w-8" /> {/* Spacer */}
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
    </div>
  );
}

/* ---------- Small helpers / inputs ---------- */
function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function AttendanceFormChurchPicker({
  value, onChange,
}: {
  value: string; onChange: (v:string)=>void;
}) {
  // Minimal: let the upsert form handle cascader; here keep a simple input
  return <Text label="Church ID" value={value} onChange={onChange} />;
}

function Text({ label, value, onChange, type="text" }:{
  label: string; value: string; onChange: (v:string)=>void; type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type={type}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }:{
  label: string; value: string; onChange: (v:string)=>void; options: string[];
}) {
  return (
    <label className="block flex-1">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o || "All"}</option>)}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v:string)=>void;
}) {
  return (
    <label className="block flex-1">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="date"
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
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