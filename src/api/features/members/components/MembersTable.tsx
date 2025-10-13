// src/features/members/components/MembersTable.tsx
import { Link } from "react-router-dom";
import { Pencil, Trash2, AtSign, Phone, MapPin } from "lucide-react";
import type { Member } from "../types/memberTypes";

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
  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-slate-200/70 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">{members.length} result(s)</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Church</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={5}>Loading…</td></tr>
            )}
            {!isLoading && error && (
              <tr><td className="px-4 py-6 text-center text-red-500" colSpan={5}>{String(error?.message || "Failed to load")}</td></tr>
            )}
            {!isLoading && !error && members.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={5}>No members found.</td></tr>
            )}

            {members.map((m) => (
              <tr key={m._id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-slate-500">{m.middleName}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3">
                    {m.email && (<span className="inline-flex items-center gap-1"><AtSign className="w-3.5 h-3.5" />{m.email}</span>)}
                    {m.phone && (<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{m.phone}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {typeof m.churchId === "object" ? (m.churchId as any)?.name : ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs">{m.membershipStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/dashboard/edit-member/${m._id}`} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100" title="Open full editor">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(m)}
                      className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                      title="Quick edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this member?")) onDelete(m._id); }}
                      className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
