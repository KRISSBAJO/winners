import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Sparkles, Search, Filter, ChevronDown, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePublicEvents } from "./hooks/useEvents";
import EventCard from "./components/EventCard";
import type { Event as EventModel } from "./types/eventTypes";

const FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function PublicEvents() {
  const [q, setQ] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // use the states here (after they exist)
  const { data, isLoading, isError, refetch } = usePublicEvents({
    q,
    type,
    page: 1,
    limit: 30,
    sort: "startDate",
  });

  const events = data?.items ?? [];
  const total = data?.total ?? 0;

  const types = ["Service", "BibleStudy", "Conference", "Outreach", "Meeting"];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-amber-100/10 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <motion.div
        className="relative z-10 text-center py-20 px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-serif font-light text-slate-900 dark:text-white drop-shadow-sm">
            Upcoming Events
          </h1>
        </motion.div>
        <motion.p
          className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Discover gatherings that inspire faith, foster community, and draw us closer to divine purpose.
        </motion.p>
      </motion.div>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
         className="fixed top-4 left-4 z-50 group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium text-sm shadow-lg transition-all duration-300 hover:from-[#D4AF37] hover:to-[#8B0000]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, x: 0 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Back</span>
      </motion.button>

      {/* Filters: Sticky, Elegant Accordion */}
      <motion.div
        className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 py-4 px-6"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
              placeholder="Search events by title or description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Desktop Filters */}
          <AnimatePresence mode="wait">
            {showFilters && (
              <motion.div
                className="hidden md:flex items-center gap-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <select
                  className="px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
                <motion.button
                  onClick={() => refetch()}
                  whileHover={{ scale: 1.02 }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  Apply Filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Filters Accordion */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="md:hidden w-full"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/30 focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                  <motion.button
                    onClick={() => {
                      refetch();
                      setShowFilters(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="mt-3 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {isLoading && <SkeletonGrid />}
        {isError && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-slate-600 dark:text-slate-300 mb-4">Couldn’t load events. Please try again.</p>
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {!isLoading && events.length > 0 && (
          <>
            <div className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Showing {events.length} of {total} events
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {(events as EventModel[]).map((ev, index) => (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    layout
                  >
                    <EventCard item={ev} to={`/events/${ev._id}`} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Teaser */}
            {total > 30 && (
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Link
                  to={`/events?page=2`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  Load More Events
                  <ChevronDown className="w-5 h-5" />
                </Link>
              </motion.div>
            )}
          </>
        )}

        {!isLoading && events.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-serif font-light text-slate-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Try adjusting your search or filters. Something divine is always on the horizon.
            </p>
          </motion.div>
        )}
      </div>

      {/* Floating Sparkles Accent */}
      <motion.div
        className="absolute bottom-10 right-10 text-amber-400/30"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-12 h-12" />
      </motion.div>
    </section>
  );
}

/* ---------- Enhanced Skeleton Grid ---------- */
function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/70 shadow-lg overflow-hidden animate-pulse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
        >
          <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
          <div className="p-6 space-y-3">
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-white/10 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}