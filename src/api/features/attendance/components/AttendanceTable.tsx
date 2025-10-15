import type { Attendance } from "../types/attendanceTypes";
import { motion } from "framer-motion";
import { Search, Calendar, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

export default function AttendanceTable({ items }: { items: Attendance[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("-serviceDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredItems = useMemo(() => {
    return items.filter((a) => 
      a.serviceDate?.includes(search) || a.serviceType?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const dateA = new Date(a.serviceDate).getTime();
      const dateB = new Date(b.serviceDate).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [items, search, sortDir]);

  const getTotal = (a: Attendance) => 
    (a.men ?? 0) + (a.women ?? 0) + (a.children ?? 0) + (a.online ?? 0) + (a.ushers ?? 0) + (a.choir ?? 0);

  const overallTotals = useMemo(() => ({
    men: filteredItems.reduce((sum, a) => sum + (a.men ?? 0), 0),
    women: filteredItems.reduce((sum, a) => sum + (a.women ?? 0), 0),
    children: filteredItems.reduce((sum, a) => sum + (a.children ?? 0), 0),
    firstTimers: filteredItems.reduce((sum, a) => sum + (a.firstTimers ?? 0), 0),
    newConverts: filteredItems.reduce((sum, a) => sum + (a.newConverts ?? 0), 0),
    holyGhostBaptisms: filteredItems.reduce((sum, a) => sum + (a.holyGhostBaptisms ?? 0), 0),
    online: filteredItems.reduce((sum, a) => sum + (a.online ?? 0), 0),
    ushers: filteredItems.reduce((sum, a) => sum + (a.ushers ?? 0), 0),
    choir: filteredItems.reduce((sum, a) => sum + (a.choir ?? 0), 0),
    total: filteredItems.reduce((sum, a) => sum + getTotal(a), 0),
  }), [filteredItems]);

  return (
    <motion.div
      className="rounded-3xl border bg-white/80 dark:bg-slate-900/70 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Search & Sort */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gradient-to-r from-slate-50/50 dark:from-slate-800/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-amber-400/50 transition-all"
            placeholder="Search by date or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSortDir(prev => prev === "desc" ? "asc" : "desc")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-700/50 transition"
        >
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">{sortDir === "desc" ? "Newest First" : "Oldest First"}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 sticky top-0 z-10 shadow-sm">
            <tr className="divide-x divide-slate-200 dark:divide-slate-700">
              <th className="px-6 py-4 text-left font-semibold">Date</th>
              <th className="px-6 py-4 text-left font-semibold">Type</th>
              <th className="px-6 py-4 text-right font-semibold">Men</th>
              <th className="px-6 py-4 text-right font-semibold">Women</th>
              <th className="px-6 py-4 text-right font-semibold">Children</th>
              <th className="px-6 py-4 text-right font-semibold">First Timers</th>
              <th className="px-6 py-4 text-right font-semibold">New Converts</th>
              <th className="px-6 py-4 text-right font-semibold">H.G. Baptisms</th>
              <th className="px-6 py-4 text-right font-semibold">Online</th>
              <th className="px-6 py-4 text-right font-semibold">Ushers</th>
              <th className="px-6 py-4 text-right font-semibold">Choir</th>
              <th className="px-6 py-4 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredItems.map((a, i) => {
              const total = getTotal(a);
              return (
                <motion.tr 
                  key={a._id} 
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 divide-x divide-slate-100 dark:divide-white/5 ${
                    i % 2 === 0 ? 'bg-white/70 dark:bg-slate-900/30' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{a.serviceDate?.slice(0,10)}</td>
                  <td className="px-6 py-4 text-amber-600 dark:text-amber-400 font-semibold">{a.serviceType}</td>
                  <td className="px-6 py-4 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">{a.men ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">{a.women ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">{a.children ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-green-600 dark:text-green-400 font-semibold">{a.firstTimers ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-blue-600 dark:text-blue-400 font-semibold">{a.newConverts ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-purple-600 dark:text-purple-400 font-semibold">{a.holyGhostBaptisms ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">{a.online ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-slate-700 dark:text-slate-300">{a.ushers ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums text-slate-700 dark:text-slate-300">{a.choir ?? 0}</td>
                  <td className="px-6 py-4 text-right tabular-nums font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">{total}</td>
                </motion.tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-semibold sticky bottom-0 z-10 shadow-md">
            <tr className="divide-x divide-slate-200 dark:divide-slate-700">
              <td className="px-6 py-4 text-left">Totals</td>
              <td className="px-6 py-4 text-left">—</td>
              <td className="px-6 py-4 text-right tabular-nums">{overallTotals.men.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums">{overallTotals.women.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums">{overallTotals.children.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums text-green-600 dark:text-green-400">{overallTotals.firstTimers.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums text-blue-600 dark:text-blue-400">{overallTotals.newConverts.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums text-purple-600 dark:text-purple-400">{overallTotals.holyGhostBaptisms.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums text-cyan-600 dark:text-cyan-400">{overallTotals.online.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums">{overallTotals.ushers.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums">{overallTotals.choir.toLocaleString()}</td>
              <td className="px-6 py-4 text-right tabular-nums text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-700/30">{overallTotals.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No attendance records found.</p>
          <p className="text-sm">Try adjusting your filters or add a new entry.</p>
        </div>
      )}
    </motion.div>
  );
}