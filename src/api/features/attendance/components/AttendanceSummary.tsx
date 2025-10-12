import { motion } from "framer-motion";
import { Users, Heart, Users2, Zap, Crown, TrendingUp, BarChart3, CalendarDays, Activity } from "lucide-react";

export default function AttendanceSummary({ totals }: {
  totals: {
    services: number; men: number; women: number; children: number;
    firstTimers: number; newConverts: number; holyGhostBaptisms: number;
    online: number; ushers: number; choir: number; total: number;
  }
}) {
  const items = [
    { label: "Services Held", value: totals.services, icon: CalendarDays, color: "text-blue-600" },
    { label: "Total Souls", value: totals.total, icon: Users2, color: "text-amber-600" },
    { label: "Men", value: totals.men, icon: Users, color: "text-red-600" },
    { label: "Women", value: totals.women, icon: Users2, color: "text-pink-600" },
    { label: "Children", value: totals.children, icon: Heart, color: "text-green-600" },
    { label: "First Timers", value: totals.firstTimers, icon: Zap, color: "text-purple-600" },
    { label: "New Converts", value: totals.newConverts, icon: Crown, color: "text-indigo-600" },
    { label: "Holy Ghost Baptisms", value: totals.holyGhostBaptisms, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Online", value: totals.online, icon: Activity, color: "text-cyan-600" },
    { label: "Ushers", value: totals.ushers, icon: Users, color: "text-orange-600" },
    { label: "Choir", value: totals.choir, icon: BarChart3, color: "text-violet-600" },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            className="group relative rounded-2xl p-6 bg-white/90 dark:bg-slate-900/70 border border-slate-200/60 dark:border-white/10 shadow-lg hover:shadow-amber-400/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Subtle Glow Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${it.color.split('-')[1]}-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <Icon className={`w-8 h-8 ${it.color} mb-3 relative z-10`} />
            <div className="text-xs text-slate-500 uppercase tracking-wide relative z-10"> {it.label} </div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white relative z-10">
              {it.value ?? 0}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}