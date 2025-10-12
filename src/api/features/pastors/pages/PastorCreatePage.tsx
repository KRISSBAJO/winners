// src/api/features/pastors/pages/PastorCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import PastorForm from "../components/PastorForm";
import { useCreatePastor } from "../hooks";
import type { PastorCreateInput } from "../types";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function PastorCreatePage() {
  const nav = useNavigate();
  const create = useCreatePastor();

  const onSubmit = async (values: PastorCreateInput) => {
    const doc = await create.mutateAsync(values);
    nav(`/dashboard/pastors/${doc._id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => nav(-1)}
            className="group inline-flex items-center justify-center rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all px-2.5 py-2 shadow-sm"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-amber-700" />
          </button>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              New Pastor
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a profile and set organizational scope & role.
            </p>
          </div>
        </div>

        {/* Brand chip */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-white shadow"
          style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">Connect Hub</span>
        </div>
      </div>

      {/* Fancy card with gradient ring */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative rounded-2xl"
      >
        {/* Gradient border outline */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            padding: 1,
            background: `linear-gradient(135deg, ${BRAND_RED}40, ${BRAND_GOLD}40)`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor" as any,
            maskComposite: "exclude",
          }}
        />

        <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm p-4 md:p-6">
          {/* Top ribbon */}
          <div className="mb-4 flex items-center gap-2">
            <div
              className="h-2 w-14 rounded-full"
              style={{ background: `linear-gradient(90deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
            />
            <span className="text-[11px] uppercase tracking-wider text-slate-500">
              Pastor Details
            </span>
          </div>

          <PastorForm onSubmit={onSubmit} submitting={create.isPending} />
        </div>
      </motion.div>
    </div>
  );
}
