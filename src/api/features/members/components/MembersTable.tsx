import { Link } from "react-router-dom";
import { Pencil, Trash2, AtSign, Phone, MapPin, Edit3, Search, ArrowUpDown, Users } from "lucide-react";
import type { Member } from "../types/memberTypes";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function MembersTable({
  members,
  isLoading,
  error,
  onEdit,
  onDelete,
}: {
  members: Member[];
  isLoading: boolean;
  error?: any;
  onEdit: (m: Member) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredItems = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase();
      return (
        `${m.firstName} ${m.middleName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        (typeof m.churchId === "object" ? (m.churchId as any)?.name?.toLowerCase() : "").includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortDir === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortBy === "status") {
        return sortDir === "asc" ? a.membershipStatus.localeCompare(b.membershipStatus) : b.membershipStatus.localeCompare(a.membershipStatus);
      }
      return 0;
    });
  }, [members, search, sortBy, sortDir]);

  const overallTotals = useMemo(() => ({
    total: filteredItems.length,
    active: filteredItems.filter(m => m.membershipStatus === "Active").length,
    visitor: filteredItems.filter(m => m.membershipStatus === "Visitor").length,
    newConvert: filteredItems.filter(m => m.membershipStatus === "New Convert").length,
    inactive: filteredItems.filter(m => m.membershipStatus === "Inactive").length,
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
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSortDir(prev => prev === "desc" ? "asc" : "desc")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-700/50 transition"
        >
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">{sortDir === "asc" ? "A-Z" : "Z-A"}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 sticky top-0 z-10 shadow-sm">
            <tr className="divide-x divide-slate-200 dark:divide-slate-700">
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Contact</th>
              <th className="px-6 py-4 text-left font-semibold">Church</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredItems.map((m, i) => (
              <motion.tr 
                key={m._id} 
                className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 divide-x divide-slate-100 dark:divide-white/5 ${
                  i % 2 === 0 ? 'bg-white/70 dark:bg-slate-900/30' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
              >
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                  <div className="font-medium">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-slate-500">{m.middleName}</div>
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3">
                    {m.email && (<span className="inline-flex items-center gap-1"><AtSign className="w-3.5 h-3.5" />{m.email}</span>)}
                    {m.phone && (<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{m.phone}</span>)}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                  <div className="text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {typeof m.churchId === "object" ? (m.churchId as any)?.name : ""}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs">{m.membershipStatus}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/dashboard/edit-member/${m._id}`} className="p-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition" title="Full editor">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => onEdit(m)} className="p-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition" title="Quick edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm("Delete this member?")) onDelete(m._id); }} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-semibold sticky bottom-0 z-10 shadow-md">
            <tr className="divide-x divide-slate-200 dark:divide-slate-700">
              <td className="px-6 py-4 text-left">Totals</td>
              <td className="px-6 py-4 text-left">—</td>
              <td className="px-6 py-4 text-left">—</td>
              <td className="px-6 py-4 text-left">—</td>
              <td className="px-6 py-4 text-right tabular-nums font-bold bg-slate-100/50 dark:bg-slate-700/30">{overallTotals.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No members found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </motion.div>
  );
}