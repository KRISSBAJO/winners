// src/api/features/pastors/components/AssignmentList.tsx
import { useMemo } from "react";
import {
  Building2,
  MapPin,
  Globe2,
  CalendarDays,
  Briefcase,
  Info,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePastorAssignments } from "..//hooks";

// --- utils (local to this file) ---
function fmtDate(d?: string | null) {
  if (!d) return "";
  // Handle "YYYY-MM-DD" or ISO like "2025-10-03T00:00:00.000Z"
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type MaybeObj =
  | string
  | { _id?: string; name?: string }
  | null
  | undefined;

function labelFor(val: MaybeObj, fallbackLabel: string) {
  if (!val) return undefined;
  if (typeof val === "string") return val;
  return val.name || val._id || fallbackLabel;
}

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function AssignmentList({ pastorId }: { pastorId: string }) {
  const { data, isLoading } = usePastorAssignments(pastorId);

  const items = useMemo(() => {
    const arr = (data ?? []).slice();
    // newest first by startDate
    arr.sort((a: any, b: any) => {
      const da = new Date(a?.startDate || 0).getTime();
      const db = new Date(b?.startDate || 0).getTime();
      return db - da;
    });
    return arr;
  }, [data]);

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
            style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
          >
            <Briefcase className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Assignment History</h3>
            <p className="text-xs text-slate-500">
              Titles, scope, and tenure (latest first)
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-20 rounded-lg bg-slate-100/70 dark:bg-slate-800/40"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-slate-500">
          No assignments yet.
        </div>
      ) : (
        <ul className="relative">
          {/* vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700 pointer-events-none" />

          <AnimatePresence initial={false}>
            {items.map((a: any, idx: number) => {
              const national = labelFor(a.nationalChurchId, "National");
              const district = labelFor(a.districtId, "District");
              const church = labelFor(a.churchId, "Church");

              const start = fmtDate(a.startDate);
              const end = fmtDate(a.endDate);
              const active = !a.endDate;

              return (
                <motion.li
                  key={a._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="pl-16 pr-4 py-4"
                >
                  {/* dot on timeline */}
                  <div
                    className={`absolute left-4 mt-2 w-4 h-4 rounded-full ring-4 ${
                      active
                        ? "bg-emerald-500 ring-emerald-100/70 dark:ring-emerald-900/30"
                        : "bg-slate-400 ring-slate-200/70 dark:ring-slate-800/50"
                    }`}
                    style={{ top: `calc(${idx * 100}% / ${items.length} + 8px)` }}
                  />

                  <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-3.5 shadow-sm">
                    {/* Top row: title + status + dates */}
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {a.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/30"
                              : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50"
                          }`}
                          title={active ? "Current assignment" : "Ended assignment"}
                        >
                          {active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <Clock3 className="w-3.5 h-3.5" /> Ended
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span className="font-medium">{start || "—"}</span>
                        <span className="opacity-60">–</span>
                        <span className="font-medium">
                          {active ? "Present" : end || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Level & Scope */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-400/20 capitalize">
                        Level: {a.level}
                      </span>

                      {national && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                          <Globe2 className="w-3.5 h-3.5" />
                          {national}
                        </span>
                      )}
                      {district && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5" />
                          {district}
                        </span>
                      )}
                      {church && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                          <Building2 className="w-3.5 h-3.5" />
                          {church}
                        </span>
                      )}
                    </div>

                    {/* Reason / meta */}
                    {(a.reason || a.createdBy || a.endedBy) && (
                      <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
                        {a.reason && (
                          <div className="inline-flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Reason</div>
                              <div className="opacity-80">{a.reason}</div>
                            </div>
                          </div>
                        )}
                        {a.createdBy && (
                          <div className="inline-flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Created By</div>
                              <div className="opacity-80">
                                {typeof a.createdBy === "object"
                                  ? (a.createdBy.name || a.createdBy._id)
                                  : a.createdBy}
                              </div>
                            </div>
                          </div>
                        )}
                        {a.endedBy && (
                          <div className="inline-flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Ended By</div>
                              <div className="opacity-80">
                                {typeof a.endedBy === "object"
                                  ? (a.endedBy.name || a.endedBy._id)
                                  : a.endedBy}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
