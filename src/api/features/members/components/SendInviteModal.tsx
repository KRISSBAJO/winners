// src/pages/members/components/SendInviteModal.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSendSelfRegInvite } from "../../../../api/features/members/hooks/useSelfRegister";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function SendInviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [churchId, setChurchId] = useState("");
  const [kind, setKind] = useState<"short" | "long">("short");
  const m = useSendSelfRegInvite();

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 grid place-items-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 border"
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Send Self-Registration Invite</h3>
              <button onClick={onClose}><X /></button>
            </div>

            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await m.mutateAsync({ email, churchId, kind })
                  .then(() => onClose())
                  .catch(() => {});
              }}
            >
              <Field label="Email" value={email} onChange={setEmail} required />
              <Field label="Church ID" value={churchId} onChange={setChurchId} required />
              <div>
                <label className="block text-xs mb-1">Form Type</label>
                <select className="w-full rounded-lg border px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value as any)}>
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={m.isPending}
                className="w-full rounded-lg text-white px-4 py-2 text-sm disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
              >
                {m.isPending ? "Sending…" : "Send Invite"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs mb-1">{label}</label>
      <input className="w-full rounded-lg border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
