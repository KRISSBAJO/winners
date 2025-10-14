// src/api/features/followup/components/LogAttemptModal.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useLogAttempt } from "../hooks/useFollowup";
import { gradient } from "../ui/theme";

export default function LogAttemptModal({
  caseId, open, onClose,
}: { caseId: string; open: boolean; onClose: () => void }) {
  const m = useLogAttempt(caseId);
  const [channel, setChannel] = useState<"email"|"sms"|"call"|"in_person"|"other">("call");
  const [outcome, setOutcome] = useState<"sent"|"connected"|"left_voicemail"|"no_answer"|"not_interested"|"prayed"|"other">("connected");
  const [content, setContent] = useState("");
  const [next, setNext] = useState<string>("");

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-xl shadow-2xl border border-white/10"
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Log Contact Attempt</h3>
              <button onClick={onClose}><X /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Channel</label>
                <select className="w-full border rounded-lg px-3 py-2" value={channel} onChange={(e)=>setChannel(e.target.value as any)}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="call">Call</option>
                  <option value="in_person">In Person</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Outcome</label>
                <select className="w-full border rounded-lg px-3 py-2" value={outcome} onChange={(e)=>setOutcome(e.target.value as any)}>
                  <option value="sent">Sent</option>
                  <option value="connected">Connected</option>
                  <option value="left_voicemail">Left Voicemail</option>
                  <option value="no_answer">No Answer</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="prayed">Prayed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs mb-1">Notes / Content</label>
              <textarea className="w-full border rounded-lg px-3 py-2" rows={4}
                value={content} onChange={(e)=>setContent(e.target.value)} />
            </div>

            <div className="mt-3">
              <label className="block text-xs mb-1">Next Action (optional)</label>
              <input type="datetime-local" className="w-full border rounded-lg px-3 py-2"
                     value={next} onChange={(e)=>setNext(e.target.value)} />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={async ()=>{
                  
                  await m.mutateAsync({
                    id: caseId,
                    payload: { channel, outcome, content, nextActionOn: next || undefined },
                  } as any);
                  onClose();
                }}
                className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow"
                style={{ background: gradient }}
              >
                <Send size={16}/> Save Attempt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
