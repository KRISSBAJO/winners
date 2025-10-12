// src/api/features/attendance/components/ChurchGrowthAnalytics.tsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DailyChart, WeeklyChart } from "./AttendanceCharts";

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

export default function ChurchGrowthAnalytics({
  churchId,
  from,
  to,
}: {
  churchId: string;
  from?: string; // e.g. "2025-09-01"
  to?: string;   // e.g. "2025-10-31"
}) {
  const { data: summary } = useQuery({
    queryKey: ["attendance", "summary", churchId, from, to],
    queryFn: () => fetchSummary({ churchId, from, to }),
    enabled: !!churchId,
    staleTime: 60_000,
  });

  const { data: timeseries } = useQuery({
    queryKey: ["attendance", "timeseries", churchId, from, to],
    queryFn: () => fetchTimeseries({ churchId, from, to }),
    enabled: !!churchId,
    staleTime: 60_000,
  });

  const { data: weekly } = useQuery({
    queryKey: ["attendance", "weekly", churchId, from, to],
    queryFn: () => fetchWeekly({ churchId, from, to }),
    enabled: !!churchId,
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
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        <KPI title="Total Attendance" value={t.total} />
        <KPI title="Avg / Service" value={avgAttendance} />
        <KPI title="First Timers" value={t.firstTimers} />
        <KPI title="New Converts" value={t.newConverts} suffix={`(${conversionRate}% of first timers)`} />
      </div>

      {/* Charts */}
      <DailyChart data={timeseries || []} />
      <WeeklyChart data={weekly || []} />
    </div>
  );
}

function KPI({ title, value, suffix }: { title: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border p-4 bg-white/80 dark:bg-slate-900/70">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value ?? 0}</div>
      {suffix && <div className="text-xs text-slate-500 mt-1">{suffix}</div>}
    </div>
  );
}
