// src/api/features/events/EventDetailPublic.tsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Heart, MessageSquare, ArrowLeft, BookOpen } from "lucide-react";
import {
  usePublicEvent,
  useToggleLike,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from "./hooks/useEvents";
import { useState } from "react";
// If you have an auth store, import it to know who can like/comment
import { useAuthStore } from "../../features/auth/store/useAuthStore";

const FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const MATTHEW_6_33 = "But seek first the kingdom of God and his righteousness, and all these things will be added to you. — Matthew 6:33";

export default function EventDetailPublic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ev, isLoading } = usePublicEvent(id);
  const toggle = useToggleLike(id!);
  const addComment = useAddComment(id!);
  const delComment = useDeleteComment(id!);
  const updComment = useUpdateComment(id!);
  const { user } = useAuthStore(); // optional
  const userId = user?._id;
  const isAdmin = user && (user.role === 'siteAdmin' || user.role === 'churchAdmin');

  if (isLoading) return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  if (!ev) return <div className="max-w-4xl mx-auto p-6">Not found</div>;

  // Compute likedByMe from likes[] and (optional) logged-in viewer id.
  // If you don't have auth here, this just controls the filled heart UI.
  // Replace `viewerId` with real user id if available.
  const viewerId = userId; // Use real user ID from auth
  const likedByMe = !!(viewerId && ev.likes?.includes?.(viewerId));

  const cover =
    (ev as any).coverImageUrl ||
    (ev as any).coverUrl ||
    (ev as any).cover?.url ||
    "";

  // Normalize tags (handles stringified-array case)
  const tags = Array.isArray(ev.tags)
    ? ev.tags
        .flatMap((t: any) => {
          if (typeof t === "string" && t.startsWith("[") && t.endsWith("]")) {
            try { return JSON.parse(t); } catch { return [t]; }
          }
          return [t];
        })
        .filter(Boolean)
    : [];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Innovative Scripture Overlay: Subtle, Animated Gradient Quote */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="absolute bottom-20 right-10 max-w-md opacity-70">
          <div className="bg-gradient-to-r from-[#8B0000]/10 via-[#D4AF37]/5 to-[#8B0000]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20 shadow-2xl">
            <div className="flex items-start gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <motion.p
                className="text-xs font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed tracking-wide"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {MATTHEW_6_33}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 space-y-8 relative z-10">
        {/* Back Header: Stylish Gradient Button */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(139, 0, 0, 0.2)' }}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium text-sm shadow-lg transition-all duration-300 hover:from-[#D4AF37] hover:to-[#8B0000]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </motion.button>

        {/* Cover */}
        <div className="relative overflow-hidden rounded-3xl shadow-xl">
          {cover ? (
            <img src={cover} alt={ev.title} className="w-full h-72 md:h-96 object-cover" />
          ) : (
            <div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold drop-shadow"
            >
              {ev.title}
            </motion.h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {ev.startDate ? FMT.format(new Date(ev.startDate)) : "—"}
                {ev.endDate && <span>– {FMT.format(new Date(ev.endDate))}</span>}
              </span>
              {ev.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {ev.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border p-6 bg-white/90 dark:bg-slate-900/70">
              <h2 className="font-semibold mb-2">About this event</h2>
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {ev.description || "—"}
              </p>
            </div>

            {/* Comments */}
            <div className="rounded-2xl border p-6 bg-white/90 dark:bg-slate-900/70">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold">Comments</h3>
                <span className="text-xs text-slate-500">
                  {ev.commentCount ?? ev.comments?.length ?? 0}
                </span>
              </div>

              {/* New comment (show if you want guests to comment, otherwise gate by auth) */}
              <NewComment
                onSubmit={(text) => addComment.mutate(text)}
                submitting={addComment.isPending}
              />

              <div className="mt-4 space-y-4">
                {(ev.comments || []).length === 0 && (
                  <div className="text-sm text-slate-500">No comments yet.</div>
                )}
                {(ev.comments || []).map((c) => (
                  <CommentItem
                    key={c._id}
                    comment={c}
                    userId={userId}
                    isAdmin={isAdmin ?? false}
                    onDelete={() => delComment.mutate(c._id)}
                    onUpdate={(text) => updComment.mutate({ commentId: c._id, text })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Side actions */}
          <div className="rounded-2xl border p-6 bg-white/90 dark:bg-slate-900/70 space-y-4 h-fit">
            <button
              onClick={() => toggle.mutate()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-white/10"
            >
              <Heart className={`w-4 h-4 ${likedByMe ? "fill-red-500 text-red-500" : ""}`} />
              Like • {ev.likeCount}
            </button>
            <div className="text-xs text-slate-500">
              Visibility: <span className="font-medium">{ev.visibility}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t: string) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full border">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------- Comments UI --------------------- */
function NewComment({
  onSubmit,
  submitting,
}: {
  onSubmit: (text: string) => void;
  submitting: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = text.trim();
        if (!v) return;
        onSubmit(v);
        setText("");
      }}
      className="flex items-start gap-3"
    >
      <textarea
        rows={3}
        className="flex-1 px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        placeholder="Write a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-2 rounded-lg text-white disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
      >
        {submitting ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

function CommentItem({
  comment,
  userId,
  isAdmin,
  onDelete,
  onUpdate,
}: {
  comment: {
    _id: string;
    author?: string;
    authorName?: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  };
  userId?: string;
  isAdmin: boolean;
  onDelete: () => void;
  onUpdate: (text: string) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(comment.text);
  const canEdit = userId === comment.author;
  const canDelete = canEdit || isAdmin; // Author or admin can delete
  const when = new Date(comment.createdAt);
  const whenFmt = `${when.toLocaleDateString()} ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return (
    <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {comment.authorName || comment.author || "Anonymous"}
        </div>
        <div className="text-xs text-slate-500">{whenFmt}</div>
      </div>
      {!edit ? (
        <p className="text-sm mt-2 whitespace-pre-wrap">{comment.text}</p>
      ) : (
        <div className="mt-2">
          <textarea
            className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => { onUpdate(text.trim()); setEdit(false); }}
              className="px-3 py-1 rounded-lg border hover:bg-slate-50 dark:hover:bg-white/10"
            >
              Save
            </button>
            <button
              onClick={() => { setText(comment.text); setEdit(false); }}
              className="px-3 py-1 rounded-lg border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {(canEdit || canDelete) && !edit && (
        <div className="mt-2 flex gap-2 text-xs">
          {canEdit && (
            <button onClick={() => setEdit(true)} className="px-2 py-1 rounded border">
              Edit
            </button>
          )}
          {canDelete && (
            <button 
              onClick={onDelete} 
              className="px-2 py-1 rounded border bg-red-50 text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}