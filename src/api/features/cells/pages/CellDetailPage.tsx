// src/pages/.../CellDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarPlus,
  UserPlus,
  Users,
  ClipboardList,
  FilePlus2,
  Save,
  Pencil,
  X,
  Trash2,
} from "lucide-react";
import {
  useCell,
  useAddMembersToCell,
  useRemoveMemberFromCell,
  useMeetings,
  useCreateMeeting,
  useDeleteMeeting,
  useReports,
  useSubmitReport,
  useUpdateReport,
  useDeleteReport
} from "../hooks/useCells";
import CreateEditCellModal from "../components/CreateEditCellModal";
import MemberPicker from "../../followup/components/MemberPicker";
import OrgCascader from "../../../../components/OrgCascader";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { toast } from "sonner";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";
type Scope = { nationalId?: string; districtId?: string; churchId?: string };

// small runtime normalizer so UI always gets arrays
function asList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.items)) return res.items as T[];
  if (Array.isArray(res?.data)) return res.data as T[];
  if (Array.isArray(res?.data?.items)) return res.data.items as T[];
  return [];
}

function Avatar({ name }: { name: string }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "?";

  // deterministic soft color
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash = (hash * 31 + initials.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;

  return (
    <div
      className="w-8 h-8 rounded-xl grid place-items-center text-[11px] font-semibold text-white shrink-0"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue+25)%360} 70% 35%))` }}
      aria-hidden
    >
      {initials}
    </div>
  );
}


/** Lightweight Drawer */
function Drawer({
  open,
  title,
  onClose,
  children,
  width = 480,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 bg-white dark:bg-slate-900 shadow-2xl border-l border-white/10 flex flex-col"
            style={{ width }}
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CellDetailPage() {
  const { id: cellId } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const nav = useNavigate();

  const { data: cell } = useCell(cellId);

  // Stable params for lists (shape doesn't change between renders)
  const baseParams = useMemo(
    () => ({
      cellId: cellId?.trim() || undefined,
      churchId: cell?.churchId || undefined,
    }),
    [cellId, cell?.churchId]
  );

  // Meetings (all for display)
  const { data: meetingsRaw = [] } = useMeetings(baseParams);
  const meetings = useMemo(() => asList(meetingsRaw), [meetingsRaw]);

  // Meetings (unreported only) for the report form picker (Drawer)
  const { data: unreportedRaw = [] } = useMeetings({ ...baseParams, onlyUnreported: true } as any);
  const unreportedMeetings = useMemo(() => asList(unreportedRaw), [unreportedRaw]);

  // Reports
  const { data: reportsRaw = [] } = useReports(baseParams);
  const reports = useMemo(() => asList(reportsRaw), [reportsRaw]);

  const deleteReport = useDeleteReport({ cellId, churchId: cell?.churchId });

  // Scope chip (read-only)
  const [scope, setScope] = useState<Scope>({});
  useEffect(() => {
    if (!cell) return;
    setScope({
      nationalId: (cell as any)?.nationalChurchId || undefined,
      districtId: (cell as any)?.districtId || undefined,
      churchId: cell.churchId || undefined,
    });
  }, [cell]);

  const [openEdit, setOpenEdit] = useState(Boolean(params.get("edit")));

  // Members
  const addMembers = useAddMembersToCell(cellId!);
  const removeMember = useRemoveMemberFromCell(cellId!);
  const [memberPicker, setMemberPicker] = useState<string>("");
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{ open: boolean; memberId?: string }>({
    open: false,
  });

  // Meetings
  const createMeeting = useCreateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const [confirmDeleteMeeting, setConfirmDeleteMeeting] = useState<{ open: boolean; id?: string }>({ open: false });
  const [when, setWhen] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [title, setTitle] = useState("");

  // Report Drawer
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);

  // Submit report (create-or-update by meeting)
  const submitReport = useSubmitReport();

  // Inline edit report
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<any>({
    totals: { men: 0, women: 0, children: 0, firstTimers: 0, newConverts: 0 },
    presentMemberIds: [] as string[],
    comments: "",
    date: "",
  });
  const updateReport = useUpdateReport(editingId || "", { cellId, churchId: cell?.churchId });

  

  // New report form state (Drawer)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [totals, setTotals] = useState({ men: 0, women: 0, children: 0, firstTimers: 0, newConverts: 0 });
  const [comments, setComments] = useState("");
  const [presentMemberIds, setPresentMemberIds] = useState<string[]>([]);

  // Derived
  const membersCount = (cell as any)?.members?.length ?? 0;
  const sortedReports = useMemo(
    () => [...reports].sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date)),
    [reports]
  );

  // Helpers
  const onChangeTotal = (key: keyof typeof totals, value: string) => {
    const n = Number(value);
    setTotals((t) => ({ ...t, [key]: Number.isFinite(n) ? n : 0 }));
  };

  const onEditTotal = (key: keyof typeof editDraft.totals, value: string) => {
    const n = Number(value);
    setEditDraft((d: any) => ({ ...d, totals: { ...d.totals, [key]: Number.isFinite(n) ? n : 0 } }));
  };

  const startEdit = (r: any) => {
    setEditingId(r._id);
    setEditDraft({
      totals: { ...r.totals },
      presentMemberIds: r.presentMemberIds?.map((m: any) => m?._id || m) ?? [],
      comments: r.comments || "",
      date: (r.date ? new Date(r.date) : new Date()).toISOString().slice(0, 10),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({
      totals: { men: 0, women: 0, children: 0, firstTimers: 0, newConverts: 0 },
      presentMemberIds: [],
      comments: "",
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const confirmDeleteReport = (id: string) => {
    setConfirmDeleteMeeting({ open: true, id });
  };

  const togglePresent = (id: string) => {
    setPresentMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const togglePresentEdit = (id: string) => {
    setEditDraft((d: any) => {
      const prev: string[] = d.presentMemberIds ?? [];
      return {
        ...d,
        presentMemberIds: prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      };
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {cell?.name || "Cell"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{cell?.title || "—"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setReportDrawerOpen(true)} className="px-4 py-2 rounded-lg border hover:bg-slate-50">
            <span className="inline-flex items-center gap-2">
              <FilePlus2 className="w-4 h-4" /> File Report
            </span>
          </button>
          <button onClick={() => setOpenEdit(true)} className="px-4 py-2 rounded-lg border hover:bg-slate-50">
            Edit Cell
          </button>
          <button onClick={() => nav("/dashboard/cells")} className="px-4 py-2 rounded-lg border">
            Back
          </button>
        </div>
      </div>

      {/* Scope (read-only) */}
      <div className="max-w-2xl">
        <OrgCascader
          compact
          disabled
          value={{
            nationalId: scope.nationalId,
            districtId: scope.districtId,
            churchId: scope.churchId,
          }}
          onChange={(v) =>
            setScope({
              nationalId: v.nationalId || undefined,
              districtId: v.districtId || undefined,
              churchId: v.churchId || undefined,
            })
          }
        />
      </div>

      {/* Top cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Members" icon={<Users className="w-4 h-4" />} value={membersCount} />
        <Card
          title="Upcoming Meetings"
          icon={<CalendarPlus className="w-4 h-4" />}
          value={meetings.filter((m: any) => m.status === "scheduled").length}
        />
        <Card title="Reports Filed" icon={<ClipboardList className="w-4 h-4" />} value={sortedReports.length} />
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Members</h3>
            <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
              {(cell as any)?.members?.length ?? 0}
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500">
            Add people to this cell and manage them here.
          </p>
        </div>

        {/* Body: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: current members list */}
          <div className="rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/60">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Current Members</div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-3">
              {((cell as any)?.members?.length ?? 0) === 0 ? (
                <div className="h-40 grid place-items-center text-sm text-slate-500">
                  No members yet.
                </div>
              ) : (
                (cell as any).members.map((m: any) => (
                  <div
                    key={m._id}
                    className="group rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 px-3 py-2.5 flex items-center gap-3"
                  >
                    <Avatar name={`${m.firstName ?? ""} ${m.lastName ?? ""}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {(m.firstName || m.lastName) ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() : "(No name)"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{m.email || m.phone || "—"}</p>
                    </div>
                    <button
                      onClick={() => setConfirmRemoveMember({ open: true, memberId: m._id })}
                      className="text-xs px-2.5 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-200"
                      title="Remove from this cell"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: picker + add */}
          <div className="rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/60">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Select Member</div>
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Search</span>
            </div>

            <div className="p-4 space-y-3">
              {/* keep your existing picker component */}
              <MemberPicker
                churchId={cell?.churchId || ""}
                value={memberPicker}
                onChange={setMemberPicker}
              />

              <div className="flex items-center justify-end">
                <button
                  disabled={!memberPicker}
                  onClick={async () => {
                    await addMembers.mutateAsync([memberPicker]);
                    setMemberPicker("");
                    toast.success("Member added");
                  }}
                  className="inline-flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-md hover:brightness-105 transition disabled:opacity-60"
                  style={{ background: BRAND }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeWidth="2" d="M19 21a8 8 0 10-14 0" />
                    <path strokeWidth="2" d="M19 10v6M22 13h-6" />
                  </svg>
                  Add
                </button>
              </div>

              {/* tiny helper text */}
              <p className="text-[11px] text-slate-500">
                Tip: Type at least <span className="font-semibold">2</span> characters to search quickly. Results are streamed as you scroll.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Meetings + list */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Schedule Meeting</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1">Title (optional)</label>
            <input className="w-full border rounded-lg px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1">When</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={async () => {
              if (!cell?.churchId || !cellId) return;
              await createMeeting.mutateAsync({
                cellId,
                churchId: cell.churchId,
                title: title || undefined,
                scheduledFor: new Date(when).toISOString(),
                status: "scheduled",
              } as any);
              setTitle("");
              toast.success("Meeting scheduled");
            }}
            className="text-white px-4 py-2 rounded-lg shadow"
            style={{ background: BRAND }}
          >
            Create Meeting
          </button>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Upcoming</h4>
          <ul className="space-y-2">
            {meetings
              .filter((m: any) => m.status !== "cancelled")
              .map((m: any) => (
                <li key={m._id} className="rounded-xl border px-3 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.title || "Cell Meeting"}</p>
                    <p className="text-xs text-slate-500 truncate">{new Date(m.scheduledFor).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">{m.status}</span>
                    <button
                      onClick={() => setConfirmDeleteMeeting({ open: true, id: m._id })}
                      className="text-xs px-2 py-1 rounded border hover:bg-red-50 text-red-600 border-red-200 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Report history */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold">Recent Reports</h3>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur z-10">
                <tr className="text-left text-slate-500">
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Men</th>
                  <th className="py-2 px-4">Women</th>
                  <th className="py-2 px-4">Children</th>
                  <th className="py-2 px-4">First Timers</th>
                  <th className="py-2 px-4">New Converts</th>
                  <th className="py-2 px-4">Comments</th>
                  <th className="py-2 px-4">Actions</th>
                  <th className="py-2 px-4">Delete</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(odd)]:bg-slate-50/40 dark:[&>tr:nth-child(odd)]:bg-white/5">
                {sortedReports.map((r: any) => {
                  const isEditing = editingId === r._id;
                  return (
                    <tr key={r._id} className="border-t hover:bg-slate-50/60 dark:hover:bg-white/5">
                      <td className="py-2 px-4 whitespace-nowrap align-top">
                        {isEditing ? (
                          <input
                            type="date"
                            className="w-[150px] border rounded px-2 py-1"
                            value={editDraft.date}
                            onChange={(e) => setEditDraft((d: any) => ({ ...d, date: e.target.value }))}
                          />
                        ) : (
                          new Date(r.date).toLocaleDateString()
                        )}
                      </td>

                      {/* Totals */}
                      {(["men", "women", "children", "firstTimers", "newConverts"] as const).map((k) => (
                        <td key={k} className="py-2 px-4 align-top">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-[90px] border rounded px-2 py-1"
                              value={editDraft.totals?.[k] ?? 0}
                              min={0}
                              onChange={(e) => onEditTotal(k, e.target.value)}
                            />
                          ) : (
                            r.totals?.[k] ?? 0
                          )}
                        </td>
                      ))}

                      <td className="py-2 px-4 max-w-[320px] align-top">
                        {isEditing ? (
                          <textarea
                            className="w-full border rounded px-2 py-1 min-h-[60px]"
                            value={editDraft.comments}
                            onChange={(e) => setEditDraft((d: any) => ({ ...d, comments: e.target.value }))}
                          />
                        ) : (
                          <span className="block truncate" title={r.comments || ""}>
                            {r.comments || "—"}
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-4 align-top">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            {/* Present members editor */}
                            <div className="grid sm:grid-cols-2 gap-2 max-h-32 overflow-auto border rounded p-2">
                              {(cell as any)?.members?.map((m: any) => {
                                const id = m._id as string;
                                const checked = (editDraft.presentMemberIds ?? []).includes(id);
                                return (
                                  <label key={id} className="flex items-center gap-2 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => togglePresentEdit(id)}
                                      className="rounded"
                                    />
                                    <span className="truncate">
                                      {m.firstName} {m.lastName}
                                    </span>
                                  </label>
                                );
                              })}
                              {!((cell as any)?.members?.length ?? 0) && (
                                <p className="text-xs text-slate-500">No members to mark present.</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                                onClick={async () => {
                                  await updateReport.mutateAsync({
                                    totals: editDraft.totals,
                                    comments: editDraft.comments || undefined,
                                    date: new Date(editDraft.date).toISOString(),
                                    presentMemberIds: editDraft.presentMemberIds,
                                  } as any);
                                  toast.success("Report updated");
                                  cancelEdit();
                                }}
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                                onClick={cancelEdit}
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                            onClick={() => startEdit(r)}
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        )}

                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                          onClick={() => confirmDeleteReport(r._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!sortedReports.length && (
                  <tr>
                    <td className="py-6 text-slate-500 text-center" colSpan={8}>
                      No reports yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Drawer */}
      <Drawer open={reportDrawerOpen} title="File Cell Meeting Report" onClose={() => setReportDrawerOpen(false)}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1">Meeting</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
            >
              <option value="">Select a meeting (unreported)</option>
              {unreportedMeetings.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {(m.title || "Cell Meeting") + " — " + new Date(m.scheduledFor).toLocaleString()}
                </option>
              ))}
            </select>
            {!unreportedMeetings.length && (
              <p className="mt-1 text-xs text-slate-500">No unreported meetings.</p>
            )}
          </div>

          <div>
            <label className="block text-xs mb-1">Report Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>

          {(["men", "women", "children", "firstTimers", "newConverts"] as const).map((k) => (
            <div key={k}>
              <label className="block text-xs mb-1 capitalize">
                {k === "firstTimers" ? "First Timers" : k === "newConverts" ? "New Converts" : k}
              </label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2"
                value={(totals as any)[k]}
                min={0}
                onChange={(e) => onChangeTotal(k as any, e.target.value)}
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="block text-xs mb-1">Present Members</label>
            <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-lg p-2">
              {(cell as any)?.members?.map((m: any) => {
                const id = m._id as string;
                const checked = presentMemberIds.includes(id);
                return (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={checked} onChange={() => togglePresent(id)} className="rounded" />
                    <span className="truncate">
                      {m.firstName} {m.lastName}
                    </span>
                  </label>
                );
              })}
              {!((cell as any)?.members?.length ?? 0) && (
                <p className="text-xs text-slate-500">No members to mark present.</p>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs mb-1">Comments</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            disabled={!cell?.churchId || !cellId || !selectedMeetingId}
            onClick={async () => {
              if (!cell?.churchId || !cellId || !selectedMeetingId) return;
              await submitReport.mutateAsync({
                churchId: cell.churchId,
                cellId: cellId,
                meetingId: selectedMeetingId, // REQUIRED
                date: new Date(reportDate).toISOString(),
                totals,
                presentMemberIds,
                comments: comments || undefined,
              } as any);
              // reset
              setSelectedMeetingId("");
              setTotals({ men: 0, women: 0, children: 0, firstTimers: 0, newConverts: 0 });
              setComments("");
              setPresentMemberIds([]);
              setReportDrawerOpen(false);
              toast.success("Report submitted");
            }}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow"
            style={{ background: BRAND }}
          >
            <Save className="w-4 h-4" /> Submit Report
          </button>
        </div>
      </Drawer>

      {/* Confirm: remove member */}
      <ConfirmDialog
        open={confirmRemoveMember.open}
        title="Remove member from cell?"
        description="This will remove the member from this cell group. You can add them again later."
        confirmText="Remove"
        onConfirm={async () => {
          if (!confirmRemoveMember.memberId) return;
          await removeMember.mutateAsync(confirmRemoveMember.memberId);
          toast.success("Member removed");
        }}
        onClose={() => setConfirmRemoveMember({ open: false })}
      />

      {/* Confirm: delete meeting */}
      <ConfirmDialog
        open={confirmDeleteMeeting.open}
        title="Delete this meeting?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (!confirmDeleteMeeting.id) return;
          await deleteMeeting.mutateAsync(confirmDeleteMeeting.id);
          toast.success("Meeting deleted");
        }}
        onClose={() => setConfirmDeleteMeeting({ open: false })}
      />

      {/* Edit cell modal */}
      <AnimatePresence>
        {openEdit && (
          <CreateEditCellModal open={openEdit} onClose={() => setOpenEdit(false)} initial={cell as any} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ title, icon, value }: { title: string; icon: React.ReactNode; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div
        className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow"
        style={{ background: BRAND }}
      >
        {icon}
      </div>
    </motion.div>
  );
}
