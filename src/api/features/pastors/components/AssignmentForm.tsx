import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, UserCog, ChevronDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toDateInputValue } from "../../../../utils/dateInput";
import OrgCascader from "../../../../components/OrgCascader";
import {
  PastorAssignInput,
  PastorLevels,
  PastorTitles,
} from "../types";
import { useCreateAssignment, useEndAssignment } from "../hooks";

type Props = { pastorId: string };

export default function AssignmentForm({ pastorId }: Props) {
  const create = useCreateAssignment(pastorId);

  const [payload, setPayload] = useState<PastorAssignInput>({
    level: "church",
    title: "Pastor",
    startDate: new Date().toISOString().slice(0, 10),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof PastorAssignInput, v: any) =>
    setPayload((s) => ({ ...s, [k]: v }));

  // Reset irrelevant scope fields when level changes
  useEffect(() => {
    if (payload.level === "national") {
      setPayload((s) => ({ ...s, districtId: undefined, churchId: undefined }));
    } else if (payload.level === "district") {
      setPayload((s) => ({ ...s, churchId: undefined }));
    }
  }, [payload.level]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!payload.title) e.title = "Title is required";
    if (!payload.startDate) e.startDate = "Start date is required";

    if (payload.level === "national" && !payload.nationalChurchId) {
      e.scope = "National Church is required for national-level assignment";
    }
    if (payload.level === "district" && !payload.districtId) {
      e.scope = "District is required for district-level assignment";
    }
    if (payload.level === "church" && !payload.churchId) {
      e.scope = "Church is required for church-level assignment";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.success("Assignment created");
        // Reset form
        setPayload({
          level: "church",
          title: "Pastor",
          startDate: new Date().toISOString().slice(0, 10),
          nationalChurchId: undefined,
          districtId: undefined,
          churchId: undefined,
          endDate: undefined,
          reason: undefined,
        });
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create assignment");
      },
    });
  };

  const scopeSummary = useMemo(() => {
    if (payload.level === "national") return "National-level";
    if (payload.level === "district") return "District-level";
    return "Church-level";
  }, [payload.level]);

  return (
    <motion.form
      onSubmit={onSubmit}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm p-4 md:p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md">
          <UserCog className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            New Assignment / Transfer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define level, title, dates and scope for this pastor.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
          <span className="font-medium">{scopeSummary}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
          <span className="truncate max-w-[10rem]">{payload.title || "—"}</span>
        </div>
      </div>

      {/* Core Fields */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Level *</label>
          <select
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              errors.level ? "border-red-400 bg-red-50/50 dark:bg-red-900/10" : "border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50"
            }`}
            value={payload.level}
            onChange={(e) => set("level", e.target.value as any)}
          >
            {PastorLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <AnimatePresence>
            {errors.level && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.level}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Title *</label>
          <select
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              errors.title ? "border-red-400 bg-red-50/50 dark:bg-red-900/10" : "border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50"
            }`}
            value={payload.title}
            onChange={(e) => set("title", e.target.value as any)}
          >
            {PastorTitles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <AnimatePresence>
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            <CalendarDays className="w-3 h-3" />
            Start Date *
          </label>
          <div className="relative">
            <input
              type="date"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm pr-9 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                errors.startDate ? "border-red-400 bg-red-50/50 dark:bg-red-900/10" : "border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50"
              }`}
              value={payload.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          <AnimatePresence>
            {errors.startDate && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.startDate}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Reason</label>
          <input
            className="w-full rounded-lg border px-3 py-2.5 text-sm border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            value={payload.reason || ""}
            onChange={(e) => set("reason", e.target.value || undefined)}
            placeholder="e.g., Transfer, Promotion"
          />
        </div>
      </div>

      {/* Scope Selector */}
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          <ChevronDown className="w-3 h-3" />
          Assignment Scope
        </label>
        <OrgCascader
          compact
          value={{
            nationalId: payload.nationalChurchId,
            districtId: payload.districtId,
            churchId: payload.churchId,
          }}
          onChange={(sc) => {
            set("nationalChurchId", sc.nationalId || undefined);
            set("districtId", sc.districtId || undefined);
            set("churchId", sc.churchId || undefined);
          }}
          className={`w-full rounded-xl border transition-all ${
            errors.scope ? "border-red-400 bg-red-50/50 dark:bg-red-900/10" : "border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50"
          }`}
        />
        <AnimatePresence>
          {errors.scope && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.scope}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <motion.button
          type="submit"
          disabled={create.isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {create.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Create Assignment"
          )}
        </motion.button>

        <AnimatePresence>
          {create.isPending && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3 text-amber-500" />
              Please wait...
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}

/* -------------------------------------------
   Optional tiny end-assignment helper button
   Use it alongside each assignment row/card
-------------------------------------------- */
export function EndAssignmentButton({
  pastorId,
  assignmentId,
  endDate,
  reason,
  className = "text-xs underline underline-offset-2 text-amber-700 hover:text-amber-800",
}: {
  pastorId: string;
  assignmentId: string;
  endDate?: string;
  reason?: string;
  className?: string;
}) {
  const end = useEndAssignment(pastorId, assignmentId);

  return (
    <motion.button
      type="button"
      onClick={() =>
        end.mutate(
          { endDate, reason },
          {
            onSuccess: () => toast.success("Assignment ended"),
            onError: (err: any) =>
              toast.error(err?.response?.data?.message || "Failed to end assignment"),
          }
        )
      }
      disabled={end.isPending}
      whileHover={{ scale: 1.05 }}
      className={`${className} transition-all`}
      title="End assignment"
    >
      {end.isPending ? "Ending…" : "End Assignment"}
    </motion.button>
  );
}