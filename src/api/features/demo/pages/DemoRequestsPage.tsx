// src/pages/.../DemoRequestsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  useDemoList,
  useUpdateDemo,
  useDeleteDemo,
} from "../../../../api/features/demo/hooks/useDemo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  X,
  Calendar,
  User,
  Church,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Users,
  UserCircle2,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import ConfirmDialog from "../../../../api/features/cells/components/ui/ConfirmDialog";

type DemoRequest = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  church?: string;
  role?: string;
  size?: string;
  interests: string[];
  goals?: string;
  timeframe?: string;
  budget?: string;
  demoPref?: string;
  notes?: string;
  consent: boolean;
  status: "new" | "in_review" | "scheduled" | "won" | "lost";
  source?: string;
  meta: { ip: string; ua: string };
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS: DemoRequest["status"][] = [
  "new",
  "in_review",
  "scheduled",
  "won",
  "lost",
];

const statusClasses: Record<DemoRequest["status"], string> = {
  new: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  in_review: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  scheduled: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  won: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export default function DemoRequestsPage() {
  // filters / pagination
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // selection + dialogs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // data
  const { data, isLoading, refetch } = useDemoList({
    q,
    status: statusFilter,
    page,
    pageSize,
  });
  const rows = useMemo<DemoRequest[]>(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // row mutations
  const upd = useUpdateDemo(focusedId || "");
  const del = useDeleteDemo();

  // derived
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const selectedRequest = useMemo(
    () => rows.find((r) => r._id === focusedId),
    [rows, focusedId]
  );

  useEffect(() => {
    // refetch when filters/pagination change
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter, page]);

  function toggleRow(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(rows.map((r) => r._id));
  }

  async function bulkDelete() {
    // naive serial; for many, do Promise.allSettled
    for (const id of selectedIds) {
      await del.mutateAsync(id);
    }
    setSelectedIds([]);
    setConfirmOpen(false);
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Demo Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} total • Page {page}/{totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            onClick={() => refetch()}
          >
            Refresh
          </button>
          <button
            disabled={!selectedIds.length}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 disabled:opacity-50 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Search name, email, church…"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>

        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm px-2 text-slate-600 dark:text-slate-300">
            {page} / {totalPages}
          </span>
          <button
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-[0] z-10">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Church</th>
                <th className="px-4 py-3">Interests</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Loading skeleton */}
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`s-${i}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-4">
                      <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    No demo requests found
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id)}
                        onChange={() => toggleRow(r._id)}
                      />
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {r.fullName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.role || "—"} {r.size ? `• ${r.size}` : ""}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Mail className="h-3.5 w-3.5 text-amber-500" />
                          <span className="truncate">{r.email}</span>
                        </div>
                        {r.phone && (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-amber-500" />
                            <span className="truncate">{r.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Church className="h-3.5 w-3.5 text-amber-500" />
                        <span className="truncate">{r.church || "—"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap gap-1.5 max-w-[360px]">
                        {r.interests.slice(0, 3).map((int) => (
                          <span
                            key={int}
                            className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium"
                          >
                            {int}
                          </span>
                        ))}
                        {r.interests.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                            +{r.interests.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                        <span>{r.budget || "—"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <select
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusClasses[r.status]}`}
                        value={r.status}
                        onChange={(e) =>
                          useUpdateDemo(r._id).mutate({ status: e.target.value as DemoRequest["status"] })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={() => {
                            setFocusedId(r._id);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs hover:bg-rose-50"
                          onClick={() => {
                            setFocusedId(r._id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            Showing {(rows.length && (page - 1) * pageSize + 1) || 0}–
            {(page - 1) * pageSize + rows.length} of {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-600 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer (side sheet) */}
      <AnimatePresence>
        {detailOpen && selectedRequest && (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-50 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setDetailOpen(false)}
            />
            {/* panel */}
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedRequest.fullName}
                  </h2>
                  <div className="mt-1 text-xs text-slate-500">
                    Submitted {new Date(selectedRequest.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <DetailItem icon={<User />} label="Name" value={selectedRequest.fullName} />
                <DetailItem icon={<Mail />} label="Email" value={selectedRequest.email} />
                {selectedRequest.phone && (
                  <DetailItem icon={<Phone />} label="Phone" value={selectedRequest.phone} />
                )}
                {selectedRequest.church && (
                  <DetailItem icon={<Church />} label="Church" value={selectedRequest.church} />
                )}
                {selectedRequest.role && (
                  <DetailItem icon={<UserCircle2 />} label="Role" value={selectedRequest.role} />
                )}
                {selectedRequest.size && (
                  <DetailItem icon={<Users />} label="Size" value={selectedRequest.size} />
                )}
                {selectedRequest.timeframe && (
                  <DetailItem icon={<Calendar />} label="Timeframe" value={selectedRequest.timeframe} />
                )}
                {selectedRequest.budget && (
                  <DetailItem icon={<DollarSign />} label="Budget" value={selectedRequest.budget} />
                )}
                {selectedRequest.demoPref && (
                  <DetailItem icon={<MessageSquare />} label="Demo Pref" value={selectedRequest.demoPref} />
                )}
              </div>

              <div className="mt-5">
                <p className="text-xs text-slate-500 mb-1">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.interests.map((int) => (
                    <span
                      key={int}
                      className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium"
                    >
                      {int}
                    </span>
                  ))}
                </div>
              </div>

              {selectedRequest.goals && (
                <div className="mt-5">
                  <p className="text-xs text-slate-500 mb-1">Goals</p>
                  <p className="text-sm">{selectedRequest.goals}</p>
                </div>
              )}

              {selectedRequest.notes && (
                <div className="mt-5">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold mb-3">Meta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <MetaRow label="IP Address" value={selectedRequest.meta.ip} />
                  <MetaRow label="User Agent" value={selectedRequest.meta.ua} />
                  <MetaRow label="Source" value={selectedRequest.source || "public_web"} />
                  <MetaRow label="Consent" value={selectedRequest.consent ? "Yes" : "No"} />
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm (single or bulk) */}
      <ConfirmDialog
        open={confirmOpen}
        title={selectedIds.length > 1 ? "Delete selected requests?" : "Delete request?"}
        description={
          selectedIds.length > 1
            ? "This will permanently remove the selected demo requests."
            : "This will permanently remove the demo request."
        }
        confirmText="Delete"
        onConfirm={async () => {
          if (selectedIds.length > 1) {
            await bulkDelete();
          } else if (focusedId) {
            await del.mutateAsync(focusedId);
            setConfirmOpen(false);
          }
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value?: string;
}) {
  const Icon = () => (
    <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
      {icon}
    </span>
  );
  return (
    <div className="flex items-start gap-3">
      <Icon />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium break-words">{value || "—"}</p>
    </div>
  );
}
