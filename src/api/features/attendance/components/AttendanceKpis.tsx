// src/api/features/attendance/components/AttendanceKpis.tsx
import {
  CalendarDays, Users, User2, UserRound, Baby, HeartPulse, Activity,
  Mic2, Headset, Sparkles
} from "lucide-react";

type Totals = {
  services: number;
  men: number; women: number; children: number;
  firstTimers: number; newConverts: number; holyGhostBaptisms: number;
  online: number; ushers: number; choir: number;
  total: number;
};

export default function AttendanceKpis({
  totals,
  className = "",
}: {
  totals: Totals;
  className?: string;
}) {
  const items = [
    { key: "services", label: "Services Held", value: totals.services, icon: CalendarDays, tint: "text-blue-600", bg: "bg-blue-50" },
    { key: "total", label: "Total Souls", value: totals.total, icon: Users, tint: "text-amber-700", bg: "bg-amber-50" },
    { key: "men", label: "Men", value: totals.men, icon: UserRound, tint: "text-sky-700", bg: "bg-sky-50" },
    { key: "women", label: "Women", value: totals.women, icon: User2, tint: "text-pink-700", bg: "bg-pink-50" },
    { key: "children", label: "Children", value: totals.children, icon: Baby, tint: "text-emerald-700", bg: "bg-emerald-50" },
    { key: "firstTimers", label: "First Timers", value: totals.firstTimers, icon: Sparkles, tint: "text-violet-700", bg: "bg-violet-50" },
    { key: "newConverts", label: "New Converts", value: totals.newConverts, icon: Activity, tint: "text-indigo-700", bg: "bg-indigo-50" },
    { key: "holyGhostBaptisms", label: "Holy Ghost Baptisms", value: totals.holyGhostBaptisms, icon: HeartPulse, tint: "text-rose-700", bg: "bg-rose-50" },
    { key: "online", label: "Online", value: totals.online, icon: Headset, tint: "text-teal-700", bg: "bg-teal-50" },
    { key: "ushers", label: "Ushers", value: totals.ushers, icon: Users, tint: "text-orange-700", bg: "bg-orange-50" },
    { key: "choir", label: "Choir", value: totals.choir, icon: Mic2, tint: "text-fuchsia-700", bg: "bg-fuchsia-50" },
  ];

  return (
    <div className={`grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}>
      {items.map((it) => (
        <KpiCard key={it.key} label={it.label} value={it.value} icon={it.icon} tint={it.tint} bg={it.bg} />
      ))}
    </div>
  );
}

function KpiCard({
  label, value, icon: Icon, tint, bg,
}: {
  label: string;
  value: number | string;
  icon: any;
  tint: string;
  bg: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-white/80 dark:bg-slate-900/70 backdrop-blur
                 hover:shadow-lg transition-all duration-300 p-4 min-h-[112px] flex flex-col"
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${bg} opacity-60`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`inline-flex items-center justify-center rounded-xl ${bg} ${tint} p-2`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
        {formatNumber(value)}
      </div>
      <div className="mt-auto text-[11px] text-slate-400">updated summary</div>
    </div>
  );
}

function formatNumber(n: any) {
  const num = Number(n ?? 0);
  return Intl.NumberFormat().format(num);
}
