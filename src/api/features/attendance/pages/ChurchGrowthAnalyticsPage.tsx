// src/api/features/attendance/pages/ChurchGrowthAnalyticsPage.tsx
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Users, TrendingUp,  Sparkles, Crown, Zap, Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { DailyChart, WeeklyChart } from "../components/AttendanceCharts";


async function fetchSummary(params: { churchId: string; from?: string; to?: string }) {
  const { data } = await axios.get("/api/attendance/summary", { params });
  return data; // { totals, byServiceType }
}

async function fetchTimeseries(params: { churchId: string; from?: string; to?: string; serviceType?: string }) {
  const { data } = await axios.get("/api/attendance/timeseries", { params });
  return data; // [{ _id: ISO, total,... }]
}

async function fetchWeekly(params: { churchId: string; from?: string; to?: string }) {
  const { data } = await axios.get("/api/attendance/weekly", { params });
  return data; // [{ _id:{week,year}, total,... }]
}

export default function ChurchGrowthAnalyticsPage() {
  const navigate = useNavigate();
  const { user, scope } = useAuthStore();
  const defaultChurchId = scope?.churchId || (user as any)?.churchId || "";
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());

  const { data: summary } = useQuery({
    queryKey: ["attendance", "summary", defaultChurchId, from, to],
    queryFn: () => fetchSummary({ churchId: defaultChurchId, from, to }),
    enabled: !!defaultChurchId,
    staleTime: 60_000,
  });

  const { data: timeseries } = useQuery({
    queryKey: ["attendance", "timeseries", defaultChurchId, from, to],
    queryFn: () => fetchTimeseries({ churchId: defaultChurchId, from, to }),
    enabled: !!defaultChurchId,
    staleTime: 60_000,
  });

  const { data: weekly } = useQuery({
    queryKey: ["attendance", "weekly", defaultChurchId, from, to],
    queryFn: () => fetchWeekly({ churchId: defaultChurchId, from, to }),
    enabled: !!defaultChurchId,
    staleTime: 60_000,
  });

  const t = summary?.totals || {
    services: 0, men: 0, women: 0, children: 0,
    firstTimers: 0, newConverts: 0, holyGhostBaptisms: 0, online: 0, ushers: 0, choir: 0, total: 0,
  };

  // Simple growth proxies (customize later):
  const avgAttendance = t.services ? Math.round(t.total / t.services) : 0;
  const conversionRate = t.firstTimers ? Math.round((t.newConverts / t.firstTimers) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-amber-100/10 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/attendance')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-amber-400/20 transition-all duration-300"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Back to Attendance</span>
      </motion.button>

      {/* Hero Header */}
      <motion.div
        className="relative z-10 text-center py-20 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-serif font-light text-slate-900 dark:text-white drop-shadow-sm">
            Church Growth Analytics
          </h1>
        </motion.div>
        <motion.p
          className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Witness the divine multiplication—souls saved, lives transformed, and the kingdom advancing through insightful metrics.
        </motion.p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12 pb-20">
        {/* Date Filters */}
        <motion.div
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Viewing: {from} to {to}</span>
            </div>
            <motion.button
              onClick={() => {
                setFrom(firstDayOfMonth());
                setTo(today());
              }}
              whileHover={{ scale: 1.02 }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Reset Dates
            </motion.button>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <KPI title="Total Attendance" value={t.total} icon={Users2} color="text-amber-600" />
          <KPI title="Avg / Service" value={avgAttendance} icon={TrendingUp} color="text-emerald-600" />
          <KPI title="First Timers" value={t.firstTimers} icon={Zap} color="text-purple-600" />
          <KPI title="New Converts" value={t.newConverts} suffix={`(${conversionRate}% rate)`} icon={Crown} color="text-indigo-600" />
        </motion.div>

        {/* Charts */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <DailyChart data={timeseries || []} />
          <WeeklyChart data={weekly || []} />
        </motion.div>
      </div>
    </div>
  );
}

function KPI({ title, value, suffix, icon: Icon, color }: { 
  title: string; 
  value: number; 
  suffix?: string;
  icon: any;
  color: string;
}) {
  return (
    <motion.div
      className="group relative rounded-3xl p-6 bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 shadow-lg hover:shadow-amber-400/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      whileHover={{ scale: 1.02 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} to-transparent/0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity`} />
      <Icon className={`w-8 h-8 ${color} mb-3 relative z-10`} />
      <div className="text-xs text-slate-500 uppercase tracking-wide relative z-10">{title}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white relative z-10">{value ?? 0}</div>
      {suffix && <div className="text-xs text-slate-500 mt-1 relative z-10">{suffix}</div>}
    </motion.div>
  );
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}