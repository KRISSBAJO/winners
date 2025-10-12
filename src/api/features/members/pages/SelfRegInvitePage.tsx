// src/api/features/members/pages/SelfRegInvitePage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import OrgCascader from "../../../../components/OrgCascader";
import { useSendSelfRegInvite } from "../../members/hooks/useSelfRegister";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

type ScopeValue = { nationalId?: string; districtId?: string; churchId?: string };

export default function SelfRegInvitePage() {
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState<"short" | "long">("short");
  const [scope, setScope] = useState<ScopeValue>({});
  const m = useSendSelfRegInvite();

  const canSubmit = !!email && !!scope.churchId && !m.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope.churchId) {
      toast.error("Please select a Church in the Organizational Scope.");
      return;
    }
    try {
      await m.mutateAsync({ email, churchId: scope.churchId, kind });
      toast.success("Invite sent");
      setEmail("");
    } catch {
      /* handled by hook toast */
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Send Member Self-Registration Invite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick the church, choose the form type, and we’ll email a secure link.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200/70 dark:border-white/10">
          <div
            className="px-4 py-2 text-white text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
          >
            Quick Tips
          </div>
          <div className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/70">
            <ul className="list-disc ml-4 space-y-1">
              <li><b>Short</b> form for fast onboarding (essential fields).</li>
              <li><b>Long</b> form for full profile details.</li>
              <li>Only church-scoped admins can invite to their church.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scope selector */}
      <OrgCascader
        value={scope}
        onChange={setScope}
        compact
        className="border-0 shadow-none p-0"
      />

      {/* Invite card */}
      <div className="max-w-2xl rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-6 shadow-sm">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs mb-1">Recipient Email *</label>
              <input
                type="email"
                className="w-full rounded-lg border px-3 py-2 bg-white/90 dark:bg-slate-800/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="member@example.com"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">Form Type</label>
              <select
                className="w-full rounded-lg border px-3 py-2 bg-white/90 dark:bg-slate-800/70"
                value={kind}
                onChange={(e) => setKind(e.target.value as "short" | "long")}
              >
                <option value="short">Short</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          {/* Scope summary */}
          <div className="text-[12px] text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-200/70 dark:border-slate-700">
            <span className="font-medium">Sending for:</span>{" "}
            <span className="opacity-90">
              {scope.nationalId ? `National ✓` : `National —`}
              {"  •  "}
              {scope.districtId ? `District ✓` : `District —`}
              {"  •  "}
              {scope.churchId ? `Church ✓` : `Church —`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-lg text-white px-4 py-2 font-semibold disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
            >
              <Send className="w-4 h-4" />
              {m.isPending ? "Sending…" : "Send Invite"}
            </motion.button>

            {!scope.churchId && (
              <span className="text-xs text-red-600">
                Select a Church to enable sending.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
