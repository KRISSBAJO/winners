import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Sparkles, ArrowRightCircle, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicEvents } from "../api/features/events/hooks/useEvents"; // adjust path if needed

const FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function Events() {
  // grab only three upcoming (sorted by startDate). Add extra filters later as needed.
  const { data, isLoading, isError, refetch } = usePublicEvents({
    limit: 3,
    page: 1,
    sort: "startDate", // earliest first; change to "-startDate" for latest first
    // type: "Service", // optional filter
    // q: "",          // optional search
  });

  const events = data?.items ?? [];

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 dark:bg-red-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-amber-100/10 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-20 relative z-10">
        <motion.div
          className="inline-flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
          <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white drop-shadow-sm font-light">
            Upcoming Events
          </h2>
        </motion.div>
        <motion.p
          className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Stay connected to what God is doing through our upcoming services and gatherings.
        </motion.p>
      </div>

      {/* States */}
      {isLoading && <SkeletonTimeline />}
      {isError && (
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="rounded-3xl p-8 border bg-white/80 dark:bg-slate-900/70 flex items-center justify-between"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Couldn’t load events. Please try again.
            </p>
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 text-sm rounded-xl border bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white hover:shadow-lg transition-all"
            >
              Retry
            </motion.button>
          </motion.div>
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <div className="relative max-w-5xl mx-auto px-6">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#8B0000]/40 via-[#D4AF37]/60 to-[#8B0000]/20 rounded-full shadow-md" />

          <div className="space-y-28">
            {events.map((ev: any, i: number) => {
              const img =
                ev.coverImageUrl ||
                ev.coverUrl ||
                ev.cover?.url ||
                "https://images.unsplash.com/photo-1520975922323-7da4b2d42e1a?auto=format&fit=crop&w=1200&q=60";
              const date = ev.startDate ? FMT.format(new Date(ev.startDate)) : "—";
              const title = ev.title ?? "Untitled";
              const desc = ev.description ?? "";

              return (
                <motion.div
                  key={ev._id || i}
                  className={`relative flex flex-col md:flex-row items-center ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-12`}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.3 }}
                  viewport={{ once: true }}
                >
                  {/* Connector dot */}
                  <motion.div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#8B0000] to-[#D4AF37] rounded-full shadow-xl border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.3 }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>

                  {/* Event Card */}
                  <div className="md:w-1/2">
                    <motion.div
                      className="relative rounded-3xl bg-white/95 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:shadow-amber-400/20 hover:-translate-y-2"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Enhanced View Icon: Larger, Branded, with Hover Glow */}
                      <Link
                        to={`/events/${ev._id}`}
                        title="View details"
                        className="absolute z-20 -right-4 -top-4 p-3 shadow-2xl rounded-2xl
                                   bg-gradient-to-br from-[#8B0000] to-[#D4AF37]
                                   text-white hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-400/50
                                   transition-all duration-300 group-hover:rotate-12"
                      >
                        <ArrowRightCircle className="w-8 h-8" />
                      </Link>

                      {/* Event Image: Fixed Aspect, Blur-Up Ready */}
                      <div className="relative overflow-hidden">
                        <motion.img
                          src={img}
                          alt={title}
                          className="w-full h-64 object-cover transition-all duration-700 group-hover:scale-110"
                          initial={{ scale: 1.1, opacity: 0.8 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1520975922323-7da4b2d42e1a?auto=format&fit=crop&w=1200&q=60"; // Fallback
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Event Info: Enhanced Typography & Icons */}
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-4 text-[#8B0000] font-semibold">
                          <CalendarDays className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{date}</span>
                          {ev.endDate && (
                            <>
                              <Clock className="w-4 h-4" />
                              <span className="text-xs opacity-80">All Day</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-[#8B0000] transition-colors">
                          {title}
                        </h3>
                        {desc && (
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {desc}
                          </p>
                        )}
                        <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-slate-500">Join the Community</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Empty Side for Symmetry */}
                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              );
            })}
          </div>

          {/* View All CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
            >
              View All Events
              <ArrowRightCircle className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <motion.div
          className="max-w-5xl mx-auto px-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-3xl p-12 border bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-serif font-light mb-2">No Events Yet</h3>
            <p className="text-sm">Please check back soon for upcoming gatherings.</p>
          </div>
        </motion.div>
      )}

      {/* Floating Sparkles */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-amber-400/40"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-16 h-16" />
      </motion.div>
    </section>
  );
}

/* ---------- Pretty skeleton while loading ---------- */
function SkeletonTimeline() {
  return (
    <div className="relative max-w-5xl mx-auto px-6">
      <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-b from-slate-300/50 via-slate-200/50 to-transparent opacity-40 rounded-full" />
      <div className="space-y-28">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`relative flex flex-col md:flex-row items-center ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-12`}
          >
            <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-slate-200 rounded-full border-4 border-white dark:border-slate-900 animate-pulse" />
            <div className="md:w-1/2">
              <div className="rounded-3xl bg-white dark:bg-slate-900/40 shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
                <div className="p-8 space-y-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-6 w-80 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}