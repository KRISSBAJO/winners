import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import MemberServerPicker from "../components/MemberPicker";
import { useOpenCase } from "../hooks/useFollowup";
import { gradient } from "../ui/theme";

type ScopeValue = { nationalId?: string; districtId?: string; churchId?: string };

export default function OpenFollowUpPage() {
  const nav = useNavigate();
  const m = useOpenCase();
  const [scope, setScope] = useState<ScopeValue>({});
  const [type, setType] = useState<"newcomer"|"absentee"|"evangelism"|"care">("newcomer");
  const [reason, setReason] = useState("");
  const [isProspect, setIsProspect] = useState(false);
  const [prospect, setProspect] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [memberId, setMemberId] = useState("");

  const canSubmit = Boolean(scope.churchId && (isProspect ? prospect.firstName : memberId));

  const submit = async () => {
    await m.mutateAsync({
      churchId: scope.churchId!,
      type,
      reason,
      memberId: !isProspect ? memberId || undefined : undefined,
      prospect: isProspect ? prospect : undefined,
    } as any);
    nav("/dashboard/follow-up");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Open Follow-Up Case</h1>
        <button
          disabled={!canSubmit || m.isPending}
          onClick={submit}
          className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow disabled:opacity-60"
          style={{ background: gradient }}
        >
          <Plus size={16}/> Create
        </button>
      </div>

      <OrgCascader value={scope} onChange={setScope} compact />

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs mb-1">Type</span>
          <select className="w-full border rounded-lg px-3 py-2"
            value={type} onChange={(e)=>setType(e.target.value as any)}>
            <option value="newcomer">Newcomer</option>
            <option value="absentee">Absentee</option>
            <option value="evangelism">Evangelism</option>
            <option value="care">Care</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs mb-1">Reason (optional)</span>
          <input className="w-full border rounded-lg px-3 py-2"
            value={reason} onChange={(e)=>setReason(e.target.value)} />
        </label>
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={isProspect} onChange={(e)=>setIsProspect(e.target.checked)} />
        <span className="text-sm">This is a new prospect (not in members)</span>
      </label>

      {!isProspect ? (
        <MemberServerPicker
          churchId={scope.churchId}
          value={memberId}
          onChange={setMemberId}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {(["firstName","lastName","email","phone"] as const).map((key)=>(
            <label key={key} className="block">
              <span className="block text-xs mb-1">{key.replace(/^./,c=>c.toUpperCase())}</span>
              <input className="w-full border rounded-lg px-3 py-2"
                value={(prospect as any)[key]}
                onChange={(e)=>setProspect(p=>({...p,[key]:e.target.value}))}/>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
