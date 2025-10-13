// src/api/features/followup/components/CadenceAssign.tsx
import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useCadence } from "../hooks/useFollowup";
import { gradient } from "../ui/theme";
import apiClient from "../../../../lib/apiClient";

type CadenceOpt = { _id: string; name: string };

export default function CadenceAssign({
  caseId, currentCadenceId,
}: { caseId: string; currentCadenceId?: string }) {
  const [list, setList] = useState<CadenceOpt[]>([]);
  const [val, setVal] = useState(currentCadenceId || "");
  const cad = useCadence(caseId);

  useEffect(() => {
    (async ()=> {
      // lightweight list endpoint; if you have /cadences?type=... use it
      const { data } = await apiClient.get("/dashboard/cadences"); // implement backend if needed
      setList(data?.items || data || []);
    })();
  }, []);

  useEffect(()=> setVal(currentCadenceId || ""), [currentCadenceId]);

  return (
    <div className="flex items-center gap-2">
      <select className="border rounded-lg px-3 py-2"
              value={val} onChange={(e)=>setVal(e.target.value)}>
        <option value="">No cadence</option>
        {list.map((c)=> <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <button
        onClick={()=>cad.set.mutate(val || null)}
        className="px-3 py-2 rounded-lg text-white"
        style={{ background: gradient }}
      >
        Save
      </button>
      <button
        onClick={()=>cad.advance.mutate()}
        className="px-3 py-2 rounded-lg border flex items-center gap-1"
        title="Advance cadence"
      >
        <Play className="w-4 h-4" /> Step
      </button>
    </div>
  );
}
