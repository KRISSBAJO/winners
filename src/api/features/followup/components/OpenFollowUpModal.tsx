// src/api/features/followup/components/OpenFollowUpModal.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useOpenCase } from "../hooks/useFollowup";
import { gradient } from "../ui/theme";
import OrgCascader from "../../../../components/OrgCascader";
import MemberPicker from "./MemberPicker";

type ScopeValue = { nationalId?: string; districtId?: string; churchId?: string };

export default function OpenFollowUpModal({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  const m = useOpenCase();

  // ✅ keep FULL scope (not just churchId)
  const [scope, setScope] = useState<ScopeValue>({});

  const [type, setType] = useState<"newcomer"|"absentee"|"evangelism"|"care">("newcomer");
  const [reason, setReason] = useState("");
  const [isProspect, setIsProspect] = useState(false);
  const [prospect, setProspect] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [memberId, setMemberId] = useState("");

  const canSubmit = Boolean(scope.churchId && (isProspect ? prospect.firstName : memberId));

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl shadow-2xl border border-white/10"
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Open Follow-Up Case</h3>
              <button onClick={onClose}><X /></button>
            </div>

            <div className="space-y-4">
              {/* ✅ pass and keep the full scope */}
              <OrgCascader
                compact
                value={scope}
                onChange={(next) => setScope(next)}
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Type</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="newcomer">Newcomer</option>
                    <option value="absentee">Absentee</option>
                    <option value="evangelism">Evangelism</option>
                    <option value="care">Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Reason (optional)</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={reason}
                    onChange={(e)=>setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input id="pros" type="checkbox" checked={isProspect} onChange={(e)=>setIsProspect(e.target.checked)} />
                <label htmlFor="pros" className="text-sm">This is a new prospect (not in members)</label>
              </div>

              {!isProspect ? (
                <MemberPicker
                  churchId={scope.churchId}
                  value={memberId}
                  onChange={setMemberId}
                  disabled={!scope.churchId || m.isPending}
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">First Name</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={prospect.firstName}
                      onChange={(e)=>setProspect(p=>({...p,firstName:e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Last Name</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={prospect.lastName}
                      onChange={(e)=>setProspect(p=>({...p,lastName:e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Email</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={prospect.email}
                      onChange={(e)=>setProspect(p=>({...p,email:e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Phone</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={prospect.phone}
                      onChange={(e)=>setProspect(p=>({...p,phone:e.target.value}))}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  disabled={!canSubmit || m.isPending}
                  onClick={async ()=>{
                    await m.mutateAsync({
                      churchId: scope.churchId!,
                      type,
                      reason,
                      memberId: !isProspect ? memberId || undefined : undefined,
                      prospect: isProspect ? prospect : undefined,
                    } as any);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow disabled:opacity-60"
                  style={{ background: gradient }}
                >
                  <Plus size={16}/> Create
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
