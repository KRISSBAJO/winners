// src/api/features/followup/pages/FollowUpCaseDetailPage.tsx
import { useParams } from "react-router-dom";
import { useFollowup, useAttempts, useAssignCase, useCaseAction } from "../hooks/useFollowup";
import LogAttemptModal from "../components/LogAttemptModal";
import ConsentPills from "../components/ConsentPills";
import CadenceAssign from "../components/CadenceAssign";
import { useState } from "react";
import { gradient } from "../ui/theme";

export default function FollowUpCaseDetailPage() {
  const { id = "" } = useParams();
  const { data: c } = useFollowup(id);
  const attempts = useAttempts(id);
  const assign = useAssignCase(id);
  const actions = useCaseAction(id);
  const [openLog, setOpenLog] = useState(false);
  const [assignee, setAssignee] = useState<string>("");

  if (!c) return <div className="p-6">Loading…</div>;

  const person =
    c.memberId && typeof c.memberId !== "string"
      ? `${c.memberId.firstName} ${c.memberId.lastName}`
      : c.prospect
      ? `${c.prospect.firstName} ${c.prospect.lastName ?? ""}`
      : "—";

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl border p-5 bg-white/90 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{person}</h2>
            <div className="text-xs text-slate-500">
              {c.type} • {c.status.replace("_"," ")} • score {c.engagementScore}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setOpenLog(true)} className="px-3 py-2 rounded-lg text-white" style={{ background: gradient }}>
              Log Attempt
            </button>
            {c.status !== "paused" ? (
              <button onClick={()=>actions.pause.mutate(c._id)} className="px-3 py-2 rounded-lg border">Pause</button>
            ) : (
              <button onClick={()=>actions.resume.mutate()} className="px-3 py-2 rounded-lg border">Resume</button>
            )}
            {c.status !== "resolved" && (
              <button onClick={()=>actions.resolve.mutate(c._id)} className="px-3 py-2 rounded-lg border">Resolve</button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Consent</h4>
            <ConsentPills caseId={c._id} consent={c.consent} />

            <h4 className="font-semibold text-sm mt-4">Assignment</h4>
            <div className="flex gap-2">
              <input className="border rounded-lg px-3 py-2" placeholder="User _id" value={assignee} onChange={(e)=>setAssignee(e.target.value)} />
              <button className="px-3 py-2 rounded-lg border" onClick={()=>assign.mutate(assignee || null)}>Assign</button>
            </div>

            <h4 className="font-semibold text-sm mt-4">Cadence</h4>
            <CadenceAssign caseId={c._id} currentCadenceId={c.cadenceId} />
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-sm mb-2">Contact Attempts</h4>
            <div className="rounded-xl border overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-3 py-2">When</th>
                    <th className="px-3 py-2">Channel</th>
                    <th className="px-3 py-2">Outcome</th>
                    <th className="px-3 py-2">Notes</th>
                    <th className="px-3 py-2">Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.data?.map((a)=>(
                    <tr key={a._id} className="border-t">
                      <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{a.channel}</td>
                      <td className="px-3 py-2">{a.outcome}</td>
                      <td className="px-3 py-2">{a.content || "—"}</td>
                      <td className="px-3 py-2">{a.nextActionOn ? new Date(a.nextActionOn).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                  {(attempts.data?.length ?? 0) === 0 && (
                    <tr><td className="px-3 py-6 text-slate-500" colSpan={5}>No attempts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <LogAttemptModal open={openLog} onClose={()=>setOpenLog(false)} caseId={c._id} />
    </div>
  );
}
