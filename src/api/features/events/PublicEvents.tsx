// src/api/features/public/PublicEvents.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicEvents } from "./hooks/useEvents";
import {EventCard} from "./EventCard";
import type { Event as EventModel } from "./types/eventTypes";

/* --------------------------------------------------------------------------
 * Brand tokens (kept in-file for the drop-in demo; consider centralizing)
 * -------------------------------------------------------------------------- */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* Small helper for pretty dates (keeps locale awareness) */
const fmt = (d?: string | Date) =>
  d ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(d)) : "";

/* Types options – align with your API values */
const EVENT_TYPES = ["Service", "BibleStudy", "Conference", "Outreach", "Meeting"] as const;

export default function PublicEvents() {
  const nav = useNavigate();

  // ---------------------------- Local state ----------------------------
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");
  const [openFilters, setOpenFilters] = useState(false);
  const [sort, setSort] = useState<"startDate" | "newest" | "alphabetical">("startDate");

  // ----------------------------- Data load ----------------------------
  const { data, isLoading, isError, refetch, isFetching } = usePublicEvents({
    q,
    type,
    page: 1,
    limit: 30,
    sort: sort === "startDate" ? "startDate" : sort,
  });

  const events = (data?.items ?? []) as EventModel[];
  const total = data?.total ?? 0;

  const activeTypeLabel = useMemo(
    () => (type ? type.replace(/([A-Z])/g, " $1").trim() : "All Types"),
    [type]
  );

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      aria-labelledby="events-title"
    >
      {/* --- Ambient background --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl bg-amber-200/30 dark:bg-amber-500/10" />
        <div className="absolute bottom-1/4 right-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl bg-rose-200/20 dark:bg-rose-500/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20" />
      </div>

      {/* --- Hero --- */}
      <motion.div
        className="relative z-10 px-6 py-16 text-center sm:py-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Hand‑picked moments to gather
        </div>
        <h1
          id="events-title"
          className="mt-4 font-serif text-slate-900 dark:text-white"
          style={{ fontSize: "clamp(1.9rem,4.2vw,3rem)", lineHeight: 1.1 }}
        >
          Upcoming Events
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Discover gatherings that inspire faith, foster community, and draw us closer to divine purpose.
        </p>
      </motion.div>

      {/* --- Back button --- */}
      <motion.button
        onClick={() => nav(-1)}
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-lg transition hover:shadow-xl"
        style={{ background: GRADIENT }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </motion.button>

      {/* --- Filter bar --- */}
      <div className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search events"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events by title, speaker or description…"
              className="w-full rounded-xl border border-slate-200/70 bg-white/60 py-2.5 pl-10 pr-3 text-sm outline-none ring-2 ring-transparent transition placeholder:text-slate-400 focus:border-amber-300/70 focus:ring-amber-200/50 dark:border-slate-700/60 dark:bg-slate-800/40"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Type chip group (desktop) */}
            <div className="hidden flex-wrap gap-2 md:flex">
              <TypeChip label="All" active={!type} onClick={() => setType("")} />
              {EVENT_TYPES.map((t) => (
                <TypeChip key={t} label={t.replace(/([A-Z])/g, " $1").trim()} active={type === t} onClick={() => setType(t)} />
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                aria-label="Sort events"
                className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 text-sm outline-none ring-2 ring-transparent transition hover:bg-white focus:border-amber-300/70 focus:ring-amber-200/50 dark:border-slate-700/60 dark:bg-slate-800/40"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="startDate">Soonest first</option>
                <option value="newest">Newest created</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setOpenFilters((s) => !s)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 text-sm transition hover:bg-white dark:border-slate-700/60 dark:bg-slate-800/40 md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              <ChevronDown className={`h-4 w-4 transition ${openFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Apply */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md md:inline-flex"
              style={{ background: GRADIENT }}
            >
              Apply
            </motion.button>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence initial={false}>
          {openFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-auto w-full max-w-6xl px-4 pb-4 md:hidden"
            >
              <div className="flex flex-wrap gap-2">
                <TypeChip label="All" active={!type} onClick={() => setType("")} />
                {EVENT_TYPES.map((t) => (
                  <TypeChip key={t} label={t.replace(/([A-Z])/g, " $1").trim()} active={type === t} onClick={() => setType(t)} />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setOpenFilters(false)}
                  className="flex-1 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm dark:border-slate-700/60 dark:bg-slate-800/40"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    refetch();
                    setOpenFilters(false);
                  }}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  style={{ background: GRADIENT }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Results --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        {/* Top meta */}
        {!isLoading && !isError && (
          <div className="mb-4 flex flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{events.length}</span> of
              <span className="font-semibold text-slate-700 dark:text-slate-200"> {total}</span> events
              {type && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">{activeTypeLabel}</span>}
            </div>
            {isFetching && <div className="animate-pulse">Refreshing…</div>}
          </div>
        )}

        {/* Content states */}
        {isLoading && <SkeletonGrid />}

        {isError && (
          <StateBlock
            icon={<Filter className="h-8 w-8 text-amber-500" />}
            title="Couldn’t load events"
            note="Please check your connection and try again."
            action={<button onClick={() => refetch()} className="rounded-xl px-5 py-2.5 text-white" style={{ background: GRADIENT }}>Retry</button>}
          />
        )}

        {!isLoading && !isError && events.length === 0 && (
          <StateBlock
            icon={<CalendarDays className="h-10 w-10 text-amber-500" />}
            title="No events match your filters"
            note="Try clearing the search or picking a different type."
            action={<button onClick={() => { setQ(""); setType(""); refetch(); }} className="rounded-xl px-5 py-2.5 text-white" style={{ background: GRADIENT }}>Clear filters</button>}
          />
        )}

        {!isLoading && !isError && events.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {events.map((ev, i) => (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    layout
                  >
                    <EventCard item={ev} to={`/events/${ev._id}`} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination teaser (replace with real pagination when backend is ready) */}
            {total > events.length && (
              <div className="mt-10 text-center">
                <Link
                  to={`/events?page=2`}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white shadow-sm hover:shadow-md"
                  style={{ background: GRADIENT }}
                >
                  Load more
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subtle floating accent */}
      <motion.div
        className="pointer-events-none absolute bottom-10 right-10 text-amber-400/30"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>
    </section>
  );
}

/* --------------------------------- UI bits -------------------------------- */
function TypeChip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
        active
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function StateBlock({
  icon,
  title,
  note,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70"
    >
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70"
        >
          <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
