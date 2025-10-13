// src/api/features/followup/components/ConsentPills.tsx
import { Check, Ban } from "lucide-react";
import { useConsent } from "../hooks/useFollowup";

export default function ConsentPills({ caseId, consent }:{
  caseId: string;
  consent?: { email?: boolean; sms?: boolean; call?: boolean };
}) {
  const m = useConsent(caseId);
  const pill = (key: "email"|"sms"|"call", label: string) => {
    const on = !!consent?.[key];
    return (
      <button
        onClick={()=>m.mutate({ [key]: !on })}
        className={`px-3 py-1 rounded-full text-xs border ${on ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
        title="Toggle consent"
      >
        <span className="inline-flex items-center gap-1">
          {on ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />} {label}
        </span>
      </button>
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
      {pill("email", "Email")}
      {pill("sms", "SMS")}
      {pill("call", "Call")}
    </div>
  );
}
