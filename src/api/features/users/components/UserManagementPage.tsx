// src/api/features/users/components/UserManagementPage.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Users,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../auth/hooks/useAuth";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import { nameOf } from "../../../../utils/presenters"; // ✅ helper that returns ref.name or fallback

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function UserManagementPage() {
  const { usersQuery, toggleActive, deleteUser, isLoading } = useUsers();
  const { user } = useAuth();

  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const list = useMemo(() => {
    let items = usersQuery.data ?? [];
    if (roleFilter) items = items.filter((u) => u.role === roleFilter);
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.role?.toLowerCase().includes(s) ||
        nameOf(u.churchId).toLowerCase().includes(s) ||
        nameOf(u.districtId).toLowerCase().includes(s) ||
        nameOf(u.nationalChurchId).toLowerCase().includes(s)
    );
  }, [usersQuery.data, q, roleFilter]);

  const total = usersQuery.data?.length ?? 0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <Users className="inline-block w-8 h-8 mr-2 -mt-1" style={{ color: BRAND_RED }} />
            User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.role === "siteAdmin"
              ? "Manage users across the organization (all scopes)."
              : "Manage users within your church scope."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center text-xs px-2 py-1 rounded-full border bg-white/70 dark:bg-slate-900/60 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" style={{ color: BRAND_GOLD }} />
            {list.length} of {total} visible
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, role, or scope…"
            className="w-full px-3 py-2 pr-10 rounded-lg border bg-white/80 dark:bg-slate-900/60 dark:border-slate-700 text-sm"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 rounded-lg border bg-white/80 dark:bg-slate-900/60 dark:border-slate-700 text-sm"
              title="Filter by role"
            >
              <option value="">All roles</option>
              <option value="siteAdmin">siteAdmin</option>
              <option value="nationalPastor">nationalPastor</option>
              <option value="districtPastor">districtPastor</option>
              <option value="churchAdmin">churchAdmin</option>
              <option value="pastor">pastor</option>
              <option value="volunteer">volunteer</option>
            </select>
            <Filter className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200/70 dark:border-white/10 p-6 text-sm">
          Loading users…
        </div>
      ) : (
        <motion.div
          layout
          className="overflow-x-auto rounded-xl shadow-sm border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70"
        >
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60">
              <tr className="text-left text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Scope</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {list.map((u) => {
                const isSite = u.role === "siteAdmin";
                const roleBadge =
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border " +
                  (isSite
                    ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/30"
                    : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700");

                return (
                  <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium leading-tight">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">{u._id}</div>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span className={roleBadge}>
                        {u.role}
                        {isSite ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 opacity-70" />
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-300">
                      <div className="text-[12px] space-y-0.5">
                        {u.nationalChurchId && (
                          <div>
                            National:{" "}
                            <span className="font-medium">
                              {nameOf(u.nationalChurchId)}
                            </span>
                          </div>
                        )}
                        {u.districtId && (
                          <div>
                            District:{" "}
                            <span className="font-medium">{nameOf(u.districtId)}</span>
                          </div>
                        )}
                        {u.churchId && (
                          <div>
                            Church:{" "}
                            <span className="font-medium">{nameOf(u.churchId)}</span>
                          </div>
                        )}
                        {!u.nationalChurchId && !u.districtId && !u.churchId && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {u.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditId(u._id)}
                          className="p-1.5 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(u._id)}
                          className="p-1.5 rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800"
                          title="Toggle active"
                        >
                          {u.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete ${u.firstName} ${u.lastName}? This cannot be undone.`
                              )
                            ) {
                              deleteUser(u._id);
                            }
                          }}
                          className="p-1.5 rounded-md border hover:bg-red-50 text-red-600 dark:hover:bg-red-950/30"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {openCreate && (
          <CreateUserModal open={openCreate} onClose={() => setOpenCreate(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editId && (
          <EditUserModal open={!!editId} userId={editId} onClose={() => setEditId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
