import { motion } from "framer-motion";
import {
  CalendarDays, MapPin, Eye, Heart, Pencil, Trash2, Tag,
} from "lucide-react";
import { useEvent, useDeleteEvent, useToggleLike } from "../hooks/useEvents";
import Comments from "../components/Comments";
import { useAuthStore } from "../../../features/auth/store/useAuthStore";

const FMT = new Intl.DateTimeFormat(undefined, {
  month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
});

export default function EventDetailAdmin({ id }: { id: string }) {
  const { user } = useAuthStore();
  const { data: ev, isLoading } = useEvent(id);
  const del = useDeleteEvent();
  const likedByMe = !!ev?.likes?.includes?.(user?._id || "");
  const toggleLike = useToggleLike(id);

  if (isLoading || !ev) {
    return (
      <div className="rounded-2xl border p-6 bg-white/80 dark:bg-slate-900/70 animate-pulse">
        Loading…
      </div>
    );
  }

  const cover = ev.cover || ev.coverImageUrl || null;
  const tags: string[] = Array.isArray(ev.tags) ? ev.tags : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-white/60 dark:bg-slate-900/60">
        {cover ? (
          <div className="relative h-64 md:h-80">
            <img src={typeof cover === "string" ? cover : cover?.url} alt={ev.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
        )}

        {/* Title row */}
        <div className="p-6 md:p-8 -mt-20 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm"
          >
            {ev.title}
          </motion.h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>{ev.startDate ? FMT.format(new Date(ev.startDate)) : "—"}</span>
              {ev.endDate && <span>– {FMT.format(new Date(ev.endDate))}</span>}
            </span>
            {ev.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {ev.location}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Eye className="w-4 h-4" /> {ev.visibility}
            </span>
            <span className="inline-flex items-center gap-2">
              <Tag className="w-4 h-4" /> {tags.length ? tags.join(", ") : "no tags"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLike.mutate()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <Heart className={`w-4 h-4 ${likedByMe ? "fill-red-500 text-red-500" : ""}`} />
            {ev.likeCount}
          </button>
          <div className="text-sm text-slate-500">
            {ev.commentCount} comment{ev.commentCount === 1 ? "" : "s"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/events?edit=${ev._id}`}
            className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 inline-flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </a>
          <button
            onClick={() => { if (confirm("Delete this event?")) del.mutate(ev._id); }}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border p-6 bg-white/80 dark:bg-slate-900/70">
          <h3 className="font-semibold mb-2">About this event</h3>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {ev.description || "—"}
          </p>
        </div>

        {/* Side meta */}
        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-slate-900/70 space-y-3">
          <MetaRow label="Type" value={ev.type} />
          <MetaRow label="Visibility" value={ev.visibility} />
          <MetaRow label="Church" value={ev.churchId} />
          {ev.createdAt && <MetaRow label="Created" value={FMT.format(new Date(ev.createdAt))} />}
          {ev.updatedAt && <MetaRow label="Updated" value={FMT.format(new Date(ev.updatedAt))} />}
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-2xl border p-6 bg-white/80 dark:bg-slate-900/70">
        <h3 className="font-semibold mb-3">Comments</h3>
        <Comments event={ev} canEditOwn={(authorId: string) => authorId === (user?._id || "")} />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value || "—"}</span>
    </div>
  );
}
