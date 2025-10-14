// src/api/features/followup/components/TagsEditor.tsx
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useTags } from "../hooks/useFollowup";

export default function TagsEditor({ caseId, tags }: { caseId: string; tags?: string[] }) {
  const [input, setInput] = useState("");
  const t = useTags(caseId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {(tags ?? []).map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-400/10">
            {tag}
            <button
              onClick={()=>t.remove.mutate(tag)}
              className="rounded hover:bg-black/5 p-0.5"
              title="Remove tag"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {(tags?.length ?? 0) === 0 && <span className="text-xs text-slate-500">No tags</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Add tag…"
          className="border rounded-lg px-3 py-1.5 text-sm"
        />
        <button
          onClick={()=>{ if(input.trim()){ t.add.mutate(input.trim()); setInput(""); } }}
          className="px-3 py-1.5 rounded-lg border text-sm inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4"/> Add
        </button>
      </div>
    </div>
  );
}
