import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  useGroup,
  useOccurrences,
  useCreateOccurrence,
  useUpdateOccurrence,
  useDeleteOccurrence,
  useListJoinRequests,
  useHandleJoinRequest,
} from "../hooks/useGroups";
import type { ObjectId, Occurrence, OccurrenceCreate, OccurrenceUpdate } from "../types/groupTypes";
import { Plus, Calendar, Clock, MapPin, Pencil, Trash2, Check, X, Users } from "lucide-react";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

export default function GroupManagePage() {
  const { id } = useParams<{ id: ObjectId }>();
  const { data: group, isLoading } = useGroup(id);
  const { data: occurrences = [] } = useOccurrences(id);
  const { data: requests = [] } = useListJoinRequests(id);
  const handleReq = useHandleJoinRequest(id!);

  const delOcc = useDeleteOccurrence(id!);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Occurrence | null>(null);

  const title = useMemo(() => (group ? group.name : "Manage Group"), [group]);

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-slate-500">Loading group…</div>;
  }
  if (!group) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-slate-500">Group not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Occurrences & join requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/admin/groups/${group._id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Edit Group
          </Link>
          <Link
            to="/dashboard/admin/groups"
            className="rounded-lg px-4 py-2 text-white shadow-md hover:brightness-110"
            style={{ background: GRADIENT }}
          >
            Back to list
          </Link>
        </div>
      </div>

      {/* Summary card */}
      <div className="mb-6 rounded-2xl border bg-white overflow-hidden">
        <div className="grid md:grid-cols-[320px,1fr]">
          <div className="relative h-40 md:h-full bg-slate-100">
            {group.coverUrl ? (
              <img src={group.coverUrl} alt={group.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1">{group.type}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{group.visibility ?? "members"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">join: {group.joinPolicy ?? "request"}</span>
              {typeof group.capacity === "number" && (
                <span className="rounded-full bg-slate-100 px-2 py-1">capacity: {group.capacity}</span>
              )}
              {group.publicArea && <span className="rounded-full bg-slate-100 px-2 py-1">{group.publicArea}</span>}
            </div>
            {group.subtitle && <div className="mt-1 text-slate-600 text-sm">{group.subtitle}</div>}
            {group.description && <div className="mt-1 text-slate-600 text-sm">{group.description}</div>}
          </div>
        </div>
      </div>

      {/* Occurrences */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" /> Occurrences
          </h2>
          <button
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white shadow-md hover:brightness-110"
            style={{ background: GRADIENT }}
            onClick={() => { setEditing(null); setEditorOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Schedule
          </button>
        </div>

        {occurrences.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-slate-500">No occurrences yet.</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Title</Th>
                  <Th>Start</Th>
                  <Th>End</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th className="w-32 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((o) => (
                  <tr key={o._id} className="border-t">
                    <Td>{o.title || "—"}</Td>
                    <Td>
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {new Date(o.startAt).toLocaleString()}
                      </div>
                    </Td>
                    <Td>{o.endAt ? new Date(o.endAt).toLocaleString() : "—"}</Td>
                    <Td>
                      <div className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {o.locationOverride || "—"}
                      </div>
                    </Td>
                    <Td className="capitalize">{o.status || "scheduled"}</Td>
                    <Td className="text-right">
                      <button
                        className="mr-2 inline-flex items-center gap-1 text-slate-700 underline"
                        onClick={() => { setEditing(o); setEditorOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 text-rose-600 underline"
                        onClick={async () => {
                          if (confirm("Delete this occurrence?")) {
                            await delOcc.mutateAsync(o._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Join Requests */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" /> Join Requests
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-slate-500">No requests.</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Message</Th>
                  <Th>Status</Th>
                  <Th className="w-36 text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-t">
                    <Td>{r.name}</Td>
                    <Td>{r.email || "—"}</Td>
                    <Td>{r.phone || "—"}</Td>
                    <Td className="max-w-[360px] truncate">{r.message || "—"}</Td>
                    <Td className="capitalize">{r.status}</Td>
                    <Td className="text-right">
                      {r.status === "pending" ? (
                        <>
                          <button
                            className="mr-3 inline-flex items-center gap-1 text-emerald-700 underline"
                            onClick={() => handleReq.mutate({ requestId: r._id, approve: true })}
                          >
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button
                            className="inline-flex items-center gap-1 text-rose-600 underline"
                            onClick={() => handleReq.mutate({ requestId: r._id, approve: false })}
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Editor */}
      {editorOpen && (
        <OccurrenceEditor
          groupId={group._id}
          occurrence={editing || undefined}
          onClose={() => { setEditorOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-3 text-left text-[13px] font-semibold text-slate-600 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-3 align-middle ${className}`}>{children}</td>;
}

/* ------------ Occurrence Editor uses hooks for create/update ------------ */
function OccurrenceEditor({
  groupId,
  occurrence,
  onClose,
}: {
  groupId: ObjectId;
  occurrence?: Occurrence;
  onClose: () => void;
}) {
  const createOcc = useCreateOccurrence(groupId);
  // bind update to current occurrence id (hook is constructed once for this editor instance)
  const updateOcc = useUpdateOccurrence(groupId, (occurrence?._id as ObjectId) || ("__none__" as ObjectId));

  const isEdit = Boolean(occurrence?._id);

  const [title, setTitle] = useState(occurrence?.title || "");
  const [startAt, setStartAt] = useState(occurrence?.startAt ? occurrence.startAt.slice(0, 16) : "");
  const [endAt, setEndAt] = useState(occurrence?.endAt ? occurrence.endAt.slice(0, 16) : "");
  const [location, setLocation] = useState(occurrence?.locationOverride || "");
  const [status, setStatus] = useState<Occurrence["status"]>(occurrence?.status || "scheduled");

  const onSave = async () => {
    const payload: OccurrenceCreate | OccurrenceUpdate = {
      title: title || undefined,
      startAt: startAt ? new Date(startAt).toISOString() : undefined!,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      locationOverride: location || undefined,
      status,
    };

    if (isEdit && occurrence?._id) {
      await updateOcc.mutateAsync(payload as OccurrenceUpdate);
    } else {
      // OccurrenceCreate requires startAt
      if (!payload.startAt) {
        alert("Start time is required");
        return;
      }
      await createOcc.mutateAsync(payload as OccurrenceCreate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{isEdit ? "Edit occurrence" : "Schedule occurrence"}</h3>
          <button onClick={onClose} className="rounded border px-2 py-1 text-sm">Close</button>
        </div>

        <div className="p-4 grid gap-3">
          <label className="text-sm">
            <div className="mb-1 font-medium">Title</div>
            <input className="w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <div className="mb-1 font-medium">Start</div>
              <input
                type="datetime-local"
                className="w-full rounded border px-3 py-2"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <div className="mb-1 font-medium">End</div>
              <input
                type="datetime-local"
                className="w-full rounded border px-3 py-2"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </label>
          </div>

          <label className="text-sm">
            <div className="mb-1 font-medium">Location (override)</div>
            <input className="w-full rounded border px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="mb-1 font-medium">Status</div>
            <select className="w-full rounded border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="scheduled">scheduled</option>
              <option value="held">held</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        </div>

        <div className="p-4 flex items-center justify-end gap-2 border-t">
          <button className="rounded border px-4 py-2" onClick={onClose}>Cancel</button>
          <button
            className="rounded px-4 py-2 text-white"
            style={{ background: GRADIENT }}
            onClick={onSave}
          >
            {isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
