import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users2, PlusCircle, BarChart3 } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import { useCellAnalytics, useReports } from "../hooks/useCells";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

type Scope = { nationalId?: string; districtId?: string; churchId?: string };

export default function CellsDashboardPage() {
  // 🔴 track ALL three ids
  const [scope, setScope] = useState<Scope>({});

  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // ✅ pass nationalId, districtId, and churchId to the hooks
  const { data: analytics } = useCellAnalytics({
    churchId: scope.churchId,
    from,
    to,
  });

  const { data: reports = [] } = useReports({
    nationalId: scope.nationalId,
    districtId: scope.districtId,
    churchId: scope.churchId,
    from,
    to,
  });

  // build weekly trend
  const trend = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reports) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-W${weekOfYear(d)}`;
      const sum = r.totals.men + r.totals.women + r.totals.children;
      map.set(key, (map.get(key) || 0) + sum);
    }
    return [...map.entries()]
      .sort()
      .map(([k, v]) => ({ week: k, attendance: v }));
  }, [reports]);

  const bars = [
    { name: "Men", value: analytics?.totals?.men ?? 0 },
    { name: "Women", value: analytics?.totals?.women ?? 0 },
    { name: "Children", value: analytics?.totals?.children ?? 0 },
    { name: "First Timers", value: analytics?.totals?.firstTimers ?? 0 },
    { name: "New Converts", value: analytics?.totals?.newConverts ?? 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header + scope */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cell Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Insights for the selected timeframe and organization scope
          </p>
        </div>

        <div className="flex gap-3 items-end">
          <div className="w-[520px] max-w-[92vw]">
            {/* ✅ capture nationalId, districtId, churchId */}
            <OrgCascader
              compact
              value={{
                nationalId: scope.nationalId,
                districtId: scope.districtId,
                churchId: scope.churchId,
              }}
              onChange={(v) =>
                setScope({
                  nationalId: v.nationalId,
                  districtId: v.districtId,
                  churchId: v.churchId,
                })
              }
            />
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs mb-1">From</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">To</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Meetings Held"
          value={analytics?.totalMeetings ?? 0}
        />
        <StatCard
          icon={<Users2 className="w-5 h-5" />}
          label="Total Attendance"
          value={
            (analytics?.totals?.men ?? 0) +
            (analytics?.totals?.women ?? 0) +
            (analytics?.totals?.children ?? 0)
          }
        />
        <StatCard
          icon={<PlusCircle className="w-5 h-5" />}
          label="First Timers"
          value={analytics?.totals?.firstTimers ?? 0}
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="New Cells Created"
          value={analytics?.cellsCreated ?? 0}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4"
        >
          <h3 className="font-semibold mb-2">Attendance Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={bars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4"
        >
          <h3 className="font-semibold mb-2">Weekly Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </div>
      <div
        className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow"
        style={{ background: BRAND }}
      >
        {icon}
      </div>
    </motion.div>
  );
}

function weekOfYear(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
}
