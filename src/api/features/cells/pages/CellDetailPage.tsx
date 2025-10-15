// src/pages/.../CellDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CalendarPlus, UserPlus, Users, ClipboardList } from "lucide-react";
import {
  useCell,
  useAddMembersToCell,
  useRemoveMemberFromCell,
  useMeetings,
  useCreateMeeting,
  useReports,
} from "../hooks/useCells";
import CreateEditCellModal from "../components/CreateEditCellModal";
import SubmitCellReportCard from "../components/SubmitCellReportCard";
import MemberPicker from "../../followup/components/MemberPicker";
import OrgCascader from "../../../../components/OrgCascader";

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

export default function CellDetailPage() {
  const { id: cellId } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const nav = useNavigate();

  const { data: cell } = useCell(cellId);

  // ✅ only filter by cellId (server already scopes by church)
  const {
    data: meetingsRaw = [],
    refetch: refetchMeetings,
  } = useMeetings(cellId ? { cellId } : { cellId: undefined });

  const {
    data: reportsRaw = [],
    refetch: refetchReports,
  } = useReports(cellId ? { cellId } : { cellId: undefined });

  // 🔒 always arrays in the component
  const meetings = useMemo(() => asList(meetingsRaw), [meetingsRaw]);
  const reports = useMemo(() => asList(reportsRaw), [reportsRaw]);

  // scope chip (read-only context)
  const [scope, setScope] = useState<Scope>({});
  useEffect(() => {
    if (!cell) return;
    setScope({
      nationalId: (cell as any)?.nationalId || undefined,
      districtId: (cell as any)?.districtId || undefined,
      churchId: cell.churchId || undefined,
    });
  }, [cell]);

  const [openEdit, setOpenEdit] = useState(Boolean(params.get("edit")));
  const addMembers = useAddMembersToCell(cellId!);
  const removeMember = useRemoveMemberFromCell(cellId!);
  const createMeeting = useCreateMeeting();

  const [memberPicker, setMemberPicker] = useState<string>("");
  const [when, setWhen] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [title, setTitle] = useState("");

  const membersCount = (cell as any)?.members?.length ?? 0;

  const sortedReports = useMemo(
    () => [...reports].sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date)),
    [reports]
  );

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

      {/* Members manage */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Members</h3>
          <div className="flex items-center gap-2">
            <MemberPicker churchId={cell?.churchId || ""} value={memberPicker} onChange={setMemberPicker} />
            <button
              disabled={!memberPicker}
              onClick={async () => {
                await addMembers.mutateAsync([memberPicker]);
                setMemberPicker("");
              }}
              className="inline-flex items-center gap-2 text-white px-3 py-2 rounded-lg"
              style={{ background: BRAND }}
            >
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(cell as any)?.members?.map((m: any) => (
            <div key={m._id} className="rounded-xl border px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {m.firstName} {m.lastName}
                </p>
                <p className="text-xs text-slate-500">{m.email || "—"}</p>
              </div>
              <button
                onClick={async () => {
                  await removeMember.mutateAsync(m._id);
                }}
                className="text-xs px-2 py-1 rounded border hover:bg-red-50 text-red-600 border-red-200"
              >
                Remove
              </button>
            </div>
          )) || <p className="text-sm text-slate-500">No members yet</p>}
        </div>
      </div>

      {/* Meetings + quick schedule */}
      <div className="grid lg:grid-cols-2 gap-6">
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
                  churchId: cell.churchId, // required by server
                  title: title || undefined,
                  scheduledFor: new Date(when).toISOString(),
                  status: "scheduled",
                } as any);
                setTitle("");
                // 🔁 make sure UI shows the new meeting even if cache missed
                refetchMeetings();
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
                    <div>
                      <p className="text-sm font-medium">{m.title || "Cell Meeting"}</p>
                      <p className="text-xs text-slate-500">{new Date(m.scheduledFor).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">{m.status}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Submit report */}
        <SubmitCellReportCard
          churchId={cell?.churchId || ""}
          cellId={cellId!}
          // If your card exposes a callback, uncomment next line:
          // onSubmitted={() => refetchReports()}
        />
      </div>

      {/* Report history */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-4">
        <h3 className="font-semibold mb-3">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Men</th>
                <th className="py-2 pr-4">Women</th>
                <th className="py-2 pr-4">Children</th>
                <th className="py-2 pr-4">First Timers</th>
                <th className="py-2 pr-4">New Converts</th>
                <th className="py-2 pr-4">Comments</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((r: any) => (
                <tr key={r._id} className="border-t">
                  <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{r.totals.men}</td>
                  <td className="py-2 pr-4">{r.totals.women}</td>
                  <td className="py-2 pr-4">{r.totals.children}</td>
                  <td className="py-2 pr-4">{r.totals.firstTimers}</td>
                  <td className="py-2 pr-4">{r.totals.newConverts}</td>
                  <td className="py-2 pr-4 max-w-[280px] truncate" title={r.comments || ""}>
                    {r.comments || "—"}
                  </td>
                </tr>
              ))}
              {!sortedReports.length && (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={7}>
                    No reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {openEdit && <CreateEditCellModal open={openEdit} onClose={() => setOpenEdit(false)} initial={cell as any} />}
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
      <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow" style={{ background: BRAND }}>
        {icon}
      </div>
    </motion.div>
  );
}
