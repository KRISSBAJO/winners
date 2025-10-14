// src/api/features/followup/components/CadenceAssign.tsx
import { useState, useEffect, useMemo } from "react";
import { Play } from "lucide-react";
import { useCadence, useCadenceList } from "../hooks/useFollowup";
import { gradient } from "../ui/theme";

type CadenceOpt = { _id: string; name: string; steps?: any[] };

export default function CadenceAssign({
  caseId, currentCadenceId, currentStepIndex = 0,
}: { caseId: string; currentCadenceId?: string; currentStepIndex?: number }) {
  const [val, setVal] = useState(currentCadenceId || "");
  const cad = useCadence(caseId);
  const listQ = useCadenceList();

  useEffect(() => setVal(currentCadenceId || ""), [currentCadenceId]);

  const list = listQ.data ?? [];
  const selected = useMemo(
    () => list.find(c => c._id === val) || list.find(c => c._id === currentCadenceId) || null,
    [list, val, currentCadenceId]
  );
  const totalSteps = selected?.steps?.length ?? 0;
  const atEnd = selected && currentStepIndex >= totalSteps;

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded-lg px-3 py-2"
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        disabled={listQ.isLoading}
      >
        <option value="">No cadence</option>
        {list.map((c)=> <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      {/* Progress hint */}
      {selected && (
        <span className="text-xs text-slate-500">
          Step {Math.min(currentStepIndex + 1, totalSteps)}/{totalSteps}
        </span>
      )}

      <button
        onClick={()=>cad.set.mutate(val || null)}
        className="px-3 py-2 rounded-lg text-white disabled:opacity-60"
        style={{ background: gradient }}
        disabled={cad.set.isPending}
      >
        Save
      </button>

      <button
        onClick={()=>cad.advance.mutate()}
        className="px-3 py-2 rounded-lg border flex items-center gap-1 disabled:opacity-60"
        title="Advance cadence"
        disabled={!selected || atEnd || cad.advance.isPending}
      >
        <Play className="w-4 h-4" /> Step
      </button>
    </div>
  );
}
