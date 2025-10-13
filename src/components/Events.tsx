import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Video,
  Users,
  Clock,
  Sparkles,
  ArrowRightCircle,
  CalendarPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicEvents } from "../api/features/events/hooks/useEvents";

/* ----------------------------- tiny utilities ----------------------------- */
const FMT_DAY = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "2-digit",
});
const FMT_FULL = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function timeRange(startISO?: string, endISO?: string) {
  if (!startISO) return "TBA";
  const s = new Date(startISO);
  if (!endISO) return FMT_FULL.format(s);
  const e = new Date(endISO);
  if (isSameDay(s, e)) {
    return `${FMT_DAY.format(s)} • ${s.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${FMT_FULL.format(s)} – ${FMT_FULL.format(e)}`;
}

function googleCalLink(ev: {
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
}) {
  if (!ev.startDate) return "#";
  const s = new Date(ev.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const e = ev.endDate
    ? new Date(ev.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    : s;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title || "Event",
    dates: `${s}/${e}`,
    details: ev.description || "",
    location: ev.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* --------------------------------- view ---------------------------------- */
export default function Events() {
  const reduce = useReducedMotion();
  const { data, isLoading, isError, refetch } = usePublicEvents({
    limit: 3,
    page: 1,
    sort: "startDate",
  });
  const events = data?.items ?? [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 py-20 sm:py-28">
      {/* bg accents */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-[8%] w-64 sm:w-80 h-64 sm:h-80 bg-red-100/25 dark:bg-red-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/5 right-[6%] w-[22rem] h-[22rem] sm:w-[28rem] sm:h-[28rem] bg-amber-100/15 dark:bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* header */}
      <div className="text-center mb-12 sm:mb-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
          <h2 className="font-serif font-light text-[clamp(2rem,5vw,3.5rem)] text-slate-900 dark:text-white tracking-tight">
            Upcoming Events
          </h2>
        </motion.div>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-2xl mx-auto text-[15px] sm:text-lg text-slate-600 dark:text-slate-300"
        >
          Stay connected to what God is doing through our services, trainings, and gatherings.
        </motion.p>
      </div>

      {/* states */}
      {isLoading && <SkeletonTimeline />}
      {isError && (
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl p-6 sm:p-8 border bg-white/80 dark:bg-slate-900/70 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Couldn’t load events. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white shadow hover:brightness-105"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* list */}
      {!isLoading && events.length > 0 && (
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* center line */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#8B0000]/40 via-[#D4AF37]/60 to-[#8B0000]/20 rounded-full" />

          <div className="space-y-8 sm:space-y-12">
            {events.map((ev: any, i: number) => {
              const img =
                ev.coverImageUrl ||
                ev.coverUrl ||
                ev.cover?.url ||
                "https://images.unsplash.com/photo-1520975922323-7da4b2d42e1a?auto=format&fit=crop&w=1200&q=60";
              const title = ev.title ?? "Untitled";
              const when = timeRange(ev.startDate, ev.endDate);
              const where = ev.isOnline
                ? "Online"
                : ev.location || ev.venue || ev.address || "On-site";
              const chipColor =
                ev.type === "Service"
                  ? "from-emerald-500 to-teal-500"
                  : ev.type === "Training"
                  ? "from-indigo-500 to-blue-500"
                  : "from-amber-500 to-rose-500";

              const Card = (
                <div className="group relative rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105">
                  {/* action */}
                  <Link
                    to={`/events/${ev._id}`}
                    title="View details"
                    className="absolute z-20 right-2 top-2 p-1.5 rounded-full bg-gradient-to-br from-[#8B0000] to-[#D4AF37] text-white shadow-md hover:scale-110 transition"
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                  </Link>

                  {/* image */}
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={img}
                      alt={title}
                      className="w-full h-32 sm:h-40 object-cover transition duration-500 group-hover:scale-110"
                      initial={reduce ? false : { scale: 1.05, opacity: 0.8 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1520975922323-7da4b2d42e1a?auto=format&fit=crop&w=1200&q=60";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                    {/* type chip */}
                    <div className="absolute left-3 bottom-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs bg-gradient-to-r ${chipColor} shadow`}
                      >
                        <CalendarDays className="w-3 h-3" />
                        {ev.type || "Gathering"}
                      </span>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-4 sm:p-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-[#8B0000] transition-colors">
                      {title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="truncate max-w-[14ch] sm:max-w-none">{when}</span>
                      </div>
                      <div className="inline-flex items-center gap-1">
                        {ev.isOnline ? (
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span className="truncate max-w-[14ch] sm:max-w-none">{where}</span>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {typeof ev.expectedAttendees === "number" && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-slate-300/60 dark:border-white/15 text-slate-700 dark:text-slate-200">
                          <Users className="w-3 h-3" />
                          {ev.expectedAttendees.toLocaleString()}
                        </span>
                      )}

                      <a
                        href={googleCalLink(ev)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/15 hover:bg-white/90 dark:hover:bg-white/15 transition"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        Add
                      </a>
                    </div>
                  </div>
                </div>
              );

              return (
                <motion.article
                  key={ev._id || i}
                  initial={reduce ? false : { opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative md:grid md:grid-cols-2 md:gap-8 items-center"
                >
                  {/* dot for this row */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-[#8B0000] to-[#D4AF37] shadow-md items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>

                  {i % 2 === 0 ? (
                    <>
                      {/* Left card, right spacer */}
                      <div className="md:col-span-1">{Card}</div>
                      <div className="hidden md:block" />
                    </>
                  ) : (
                    <>
                      {/* Left spacer, right card */}
                      <div className="hidden md:block" />
                      <div className="md:col-span-1">{Card}</div>
                    </>
                  )}
                </motion.article>
              );
            })}
          </div>

          {/* view all */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mt-10"
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:brightness-105 transition"
            >
              View All
              <ArrowRightCircle className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-6 text-center"
        >
          <div className="rounded-3xl p-10 sm:p-12 border bg-white/85 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-14 h-14 text-amber-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-xl sm:text-2xl font-serif font-light mb-1">No Events Yet</h3>
            <p className="text-sm">Please check back soon for upcoming gatherings.</p>
          </div>
        </motion.div>
      )}
    </section>
  );
}

/* ---------------------------- fancy skeleton ---------------------------- */
function SkeletonTimeline() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-b from-slate-300/50 via-slate-200/50 to-transparent rounded-full" />
      <div className="space-y-8 sm:space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="md:grid md:grid-cols-2 items-center md:gap-8">
            <div className="rounded-2xl overflow-hidden border bg-white/80 dark:bg-slate-900/40 shadow animate-pulse">
              <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
              <div className="p-4 sm:p-6 space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded" />
              </div>
            </div>
            <div className="hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}