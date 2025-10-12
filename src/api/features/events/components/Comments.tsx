import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Event } from "../types/eventTypes";
import { useAddComment, useDeleteComment, useUpdateComment } from "../hooks/useEvents";

export default function Comments({ event, canEditOwn }: { event: Event; canEditOwn: (authorId: string)=>boolean }) {
  const [text, setText] = useState("");
  const add = useAddComment(event._id);
  const update = useUpdateComment(event._id);
  const remove = useDeleteComment(event._id);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          placeholder="Write a comment…"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <button
          onClick={() => { if (text.trim()) { add.mutate(text.trim()); setText(""); } }}
          className="px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        >
          Post
        </button>
      </div>

      <ul className="space-y-2">
        {event.comments.map(c => (
          <CommentRow key={c._id} c={c} canEdit={canEditOwn(c.author)}
            onUpdate={(txt)=>update.mutate({ commentId: c._id, text: txt })}
            onDelete={()=>remove.mutate(c._id)}
          />
        ))}
      </ul>
    </div>
  );
}

function CommentRow({
  c, canEdit, onUpdate, onDelete
}: {
  c: any; canEdit: boolean; onUpdate: (t:string)=>void; onDelete: ()=>void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(c.text);

  return (
    <li className="rounded-lg border border-slate-200/60 dark:border-white/10 p-3">
      <div className="text-sm">
        <span className="font-medium">{c.authorName || "User"}</span>{" "}
        <span className="opacity-60">• {new Date(c.createdAt).toLocaleString()}</span>
      </div>

      {editing ? (
        <div className="mt-2 flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70" value={val} onChange={(e)=>setVal(e.target.value)} />
          <button className="px-3 py-2 rounded-lg border" onClick={()=>{ onUpdate(val); setEditing(false); }}>Save</button>
          <button className="px-3 py-2 rounded-lg border" onClick={()=>setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <p className="mt-1 text-sm">{c.text}</p>
      )}

      {canEdit && !editing && (
        <div className="mt-2 flex gap-2 text-xs">
          <button onClick={()=>setEditing(true)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </li>
  );
}
