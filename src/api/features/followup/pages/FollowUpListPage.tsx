// src/api/features/followup/pages/FollowUpListPage.tsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Users } from "lucide-react";
import { useFollowupList, useFollowupStats } from "../hooks/useFollowup";
import OpenFollowUpModal from "../components/OpenFollowUpModal";
import { Link } from "react-router-dom";
import { BRAND_RED, BRAND_GOLD } from "../ui/theme";

export default function FollowUpListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useFollowupList({ q, status, type, page: 1, limit: 50, sort: "recent" });
  const stats = useFollowupStats();

  const items = data?.items || [];

  const StatCard = ({ label, value }:{label:string; value:number}) => (
    <div className="rounded-xl border p-4 bg-white/90 dark:bg-slate-900/70">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          <Users className="inline-block w-7 h-7 -mt-1 mr-2" /> Follow-Up
        </h1>
        <button
          onClick={()=>setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
          style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
        >
          <Plus size={16}/> Open Case
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Open" value={stats.data?.open || 0}/>
        <StatCard label="In Progress" value={stats.data?.inProgress || 0}/>
        <StatCard label="Paused" value={stats.data?.paused || 0}/>
        <StatCard label="Resolved" value={stats.data?.resolved || 0}/>
      </div>

      <div className="rounded-2xl border p-4 bg-white/90 dark:bg-slate-900/70 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input value={q} onChange={(e)=>setQ(e.target.value)}
                   className="border rounded-lg px-3 py-2 pr-10" placeholder="Search name, email, phone, reason…" />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select className="border rounded-lg px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
            <select className="border rounded-lg px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
              <option value="">All types</option>
              <option value="newcomer">Newcomer</option>
              <option value="absentee">Absentee</option>
              <option value="evangelism">Evangelism</option>
              <option value="care">Care</option>
            </select>
          </div>
        </div>

        <motion.div layout className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left">
              <tr>
                <th className="px-3 py-2">Person</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="px-3 py-6" colSpan={6}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-3 py-6 text-slate-500" colSpan={6}>No cases found.</td></tr>
              ) : items.map((c)=>(
                <tr key={c._id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {c.memberId && typeof c.memberId !== "string"
                        ? `${c.memberId.firstName} ${c.memberId.lastName}`
                        : c.prospect
                        ? `${c.prospect.firstName} ${c.prospect.lastName ?? ""}`
                        : "—"}
                    </div>
                    <div className="text-[11px] text-slate-500">{c.prospect?.email || (typeof c.memberId !== "string" ? c.memberId?.email : "")}</div>
                  </td>
                  <td className="px-3 py-2 capitalize">{c.type}</td>
                  <td className="px-3 py-2 capitalize">{c.status.replace("_"," ")}</td>
                  <td className="px-3 py-2">{c.engagementScore}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.map(t=>(
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-400/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link to={`/dashboard/followup/${c._id}`} className="px-3 py-1 rounded-lg border">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      <OpenFollowUpModal open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
