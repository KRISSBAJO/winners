// src/api/features/cells/components/SubmitCellReportCard.tsx
import { useState } from "react";
import { useSubmitReport } from "../hooks/useCells";
const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

export default function SubmitCellReportCard({
  churchId, cellId, meetingId, defaultDate,
}: { churchId: string; cellId: string; meetingId?: string; defaultDate?: string }) {
  const m = useSubmitReport();
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0,10));
  const [totals, setTotals] = useState({ men:0, women:0, children:0, firstTimers:0, newConverts:0 });
  const [comments, setComments] = useState("");

  return (
    <div className="rounded-2xl border p-4 bg-white/90 dark:bg-slate-900/70">
      <h4 className="font-semibold mb-3">Submit Weekly Report</h4>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs mb-1">Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2"
            value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-5 gap-3 mt-3">
        {(["men","women","children","firstTimers","newConverts"] as const).map((k) => (
          <div key={k}>
            <label className="block text-xs mb-1 capitalize">{k}</label>
            <input type="number" min={0} className="w-full border rounded-lg px-3 py-2"
              value={totals[k]} onChange={(e)=>setTotals(t=>({...t,[k]: Number(e.target.value||0)}))}/>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <label className="block text-xs mb-1">Comments</label>
        <textarea className="w-full border rounded-lg px-3 py-2" value={comments} onChange={(e)=>setComments(e.target.value)} />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={async ()=>{
            await m.mutateAsync({
              churchId,
              cellId,
              meetingId,
              date: new Date(date).toISOString(),
              totals,
              presentMemberIds: [],
              comments,
            });
            setTotals({ men:0, women:0, children:0, firstTimers:0, newConverts:0 });
            setComments("");
          }}
          className="text-white px-4 py-2 rounded-lg shadow"
          style={{ background: BRAND }}
          disabled={m.isPending}
        >
          {m.isPending ? "Submitting…" : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
