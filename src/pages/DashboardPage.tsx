import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  BarChart3,
  Activity,
  TrendingUp,
  HeartHandshake,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

const stats = [
  {
    title: "Total Members",
    value: "1,280",
    icon: Users,
    trend: "+12 this month",
    color: "text-blue-500",
  },
  {
    title: "New Converts",
    value: "48",
    icon: UserPlus,
    trend: "+5 this week",
    color: "text-emerald-500",
  },
  {
    title: "First Timers",
    value: "15",
    icon: HeartHandshake,
    trend: "Welcome!",
    color: "text-pink-500",
  },
  {
    title: "Attendance Rate",
    value: "85%",
    icon: BarChart3,
    trend: "+2% vs last week",
    color: "text-yellow-500",
  },
];

const growthData = [
  { month: "Jan", members: 800 },
  { month: "Feb", members: 850 },
  { month: "Mar", members: 910 },
  { month: "Apr", members: 1020 },
  { month: "May", members: 1100 },
  { month: "Jun", members: 1180 },
  { month: "Jul", members: 1280 },
];

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-10 container mx-auto p-6"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back! Here's an overview of your ministry growth.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white px-5 py-2.5 rounded-lg font-medium shadow hover:shadow-lg transition"
        >
          View Reports
        </motion.button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 glass-pane border border-white/20 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {item.value}
                </h2>
              </div>
              <div
                className={`p-3 rounded-xl bg-gradient-to-br from-slate-100/40 to-white/10 dark:from-slate-800/30 dark:to-slate-700/20 ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm mt-3 text-emerald-600 dark:text-emerald-400">
              {item.trend}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CHART */}
      <div className="glass-pane p-6 rounded-2xl border border-white/10 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Membership Growth Trend
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <TrendingUp size={16} />
            Updated July 2025
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BRAND_RED} stopOpacity={0.6} />
                <stop offset="95%" stopColor={BRAND_RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--text-secondary)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: "8px",
                border: "none",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: BRAND_RED }}
            />
            <Area
              type="monotone"
              dataKey="members"
              stroke={BRAND_RED}
              strokeWidth={2}
              fill="url(#colorGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="glass-pane p-6 rounded-2xl border border-white/10 shadow-md">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Recent Activity
        </h2>
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-emerald-500" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                5 new members added to Choir Ministry
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              2 hours ago
            </span>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-yellow-500" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                2 first-timers registered this Sunday
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              1 day ago
            </span>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-red-500" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Follow-up calls completed for 3 converts
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              3 days ago
            </span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
