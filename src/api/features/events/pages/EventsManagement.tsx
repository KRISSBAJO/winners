// src/api/features/events/pages/EventsManagement.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Heart, PartyPopper } from "lucide-react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useEvent,
  useToggleLike,
} from "../hooks/useEvents";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import Comments from "../components/Comments";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";

export default function EventsManagement() {
  const { user, scope } = useAuthStore();

  // prefer explicit scope (user may switch context); fall back to user's own churchId
  const defaultChurchId = scope?.churchId || (user as any)?.churchId || "";
  const isSiteAdmin = user?.role === "siteAdmin";

  const [filters, setFilters] = useState({
    q: "",
    type: "",
    churchId: defaultChurchId,
  });

  // keep list filter in sync with scope changes
  useEffect(() => {
    setFilters((p) => ({ ...p, churchId: defaultChurchId }));
  }, [defaultChurchId]);

  const { data, isLoading } = useEvents({
    ...filters,
    page: 1,
    limit: 30,
    sort: "-createdAt",
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">
          <PartyPopper className="inline-block w-6 h-6 mr-2 text-amber-700" />
          Manage Events
          <span className="text-sm text-slate-500 block font-normal">
            (Create, edit, and organize church events)
          </span>
          </h1>
        
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md"
          style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
            placeholder="Search…"
            value={filters.q}
            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          />
        </div>

        <select
          className="px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={filters.type}
          onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
        >
          <option value="">All types</option>
          {["Service", "BibleStudy", "Conference", "Outreach", "Meeting"].map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>

        <input
          placeholder="Church ID"
          className="px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={filters.churchId}
          onChange={(e) =>
            setFilters((p) => ({ ...p, churchId: e.target.value }))
          }
        />
      </div>

      {isLoading && <div>Loading…</div>}

      {/* List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((ev) => (
          <div key={ev._id} className="relative">
            <EventCard item={ev} to={`/dashboard/events/${ev._id}`} />
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                onClick={() => {
                  setEditing(ev);
                  setOpen(true);
                }}
                className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <DeleteButton id={ev._id} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
<AnimatePresence>
  {open && (
    <motion.div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-white/10 overflow-hidden"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur">
          <h3 className="text-lg font-semibold">
            {editing ? "Edit Event" : "Create Event"}
          </h3>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <FormWrapper
            editing={editing}
            onDone={() => {
              setOpen(false);
              setEditing(null);
            }}
            defaultChurchId={defaultChurchId}
            canChangeChurch={isSiteAdmin || user?.role === "churchAdmin"}
            useOrgCascader={isSiteAdmin}
          />
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 px-6 py-3 border-t border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur flex justify-end">
          <button
            onClick={() => {
              setOpen(false);
              setEditing(null);
            }}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}

function FormWrapper({
  editing,
  onDone,
  defaultChurchId,
  canChangeChurch,
  useOrgCascader,
}: {
  editing: any;
  onDone: () => void;
  defaultChurchId: string;
  canChangeChurch: boolean;
  useOrgCascader: boolean;
}) {
  const create = useCreateEvent();
  const update = useUpdateEvent();

  const handleSubmit = (values: any) => {
    // Always ensure churchId is sent
    const payload = {
      ...values,
      churchId: values.churchId || defaultChurchId,
    };

    if (editing)
      update.mutate(
        { id: editing._id, payload },
        {
          onSuccess: onDone,
        }
      );
    else
      create.mutate(payload, {
        onSuccess: onDone,
      });
  };

  return (
    <EventForm
      initial={
        editing
          ? {
              churchId: editing.churchId,
              title: editing.title,
              description: editing.description,
              type: editing.type,
              startDate: editing.startDate?.slice(0, 16),
              endDate: editing.endDate?.slice(0, 16),
              location: editing.location,
              visibility: editing.visibility,
              tags: editing.tags,
            }
          : { type: "Service", visibility: "public" }
      }
      onSubmit={handleSubmit}
      submitting={create.isPending || update.isPending}
      defaultChurchId={defaultChurchId}
      canChangeChurch={canChangeChurch}
      useOrgCascader={useOrgCascader}
    />
  );
}

function DeleteButton({ id }: { id: string }) {
  const del = useDeleteEvent();
  return (
    <button
      onClick={() => {
        if (confirm("Delete this event?")) del.mutate(id);
      }}
      className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

/* ---------- Example detail (inside dashboard) ---------- */
export function EventDetailAdmin({ id }: { id: string }) {
  const { data } = useEvent(id);
  const likedByMe = false; // TODO: derive from logged-in user id (if you store likes per user)
  const toggle = useToggleLike(id);

  if (!data) return null;

  const canEditOwn = (_authorId: string) => true; // adjust if you gate comment editing

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4 bg-white/80 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{data.title}</h2>
          <button
            onClick={() => toggle.mutate()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
          >
            <Heart className="w-4 h-4" /> {data.likeCount}
          </button>
        </div>
        {data.description && <p className="mt-2 text-sm">{data.description}</p>}
      </div>

      <div className="rounded-xl border p-4 bg-white/80 dark:bg-slate-900/70">
        <h3 className="font-semibold mb-2">Comments</h3>
        <Comments event={data} canEditOwn={canEditOwn} />
      </div>
    </div>
  );
}
