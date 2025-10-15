import { CalendarDays, MapPin, Heart, MessageSquare } from "lucide-react";
import type { Event } from "../types/eventTypes";
import { Link } from "react-router-dom";

const BRAND_RED  = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function EventCard({ item, to }: { item: Event; to?: string }) {
  const start = new Date(item.startDate);
  const end   = item.endDate ? new Date(item.endDate) : undefined;

  const dateBadge = (
    <div className="absolute left-3 top-3 z-10 rounded-xl overflow-hidden shadow-md select-none">
      <div
        className="px-3 py-2 text-white text-center leading-tight"
        style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
      >
        <div className="text-[10px] uppercase tracking-wide opacity-90">
          {start.toLocaleString(undefined, { month: "short" })}
        </div>
        <div className="text-lg font-extrabold -mt-0.5 tabular-nums">
          {start.getDate()}
        </div>
      </div>
    </div>
  );

  return (
    <Link
      to={to || "#"}
      className="group block rounded-2xl overflow-hidden border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:shadow-lg transition-transform hover:-translate-y-0.5"
      aria-label={`Open event ${item.title}`}
    >
      {/* Media */}
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-400">
              <CalendarDays className="w-8 h-8 opacity-60" />
            </div>
          )}
        </div>

        {/* Overlay gradient + title on hover for visual pop */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {dateBadge}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Chips */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {item.type && (
            <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-amber-100/70 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
              {item.type}
            </span>
          )}
          {item.visibility && (
            <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100/70 text-slate-700 dark:bg-white/10 dark:text-slate-300">
              {item.visibility}
            </span>
          )}
          {item.tags?.slice(0, 2).map((t) => (
            <span key={t} className="px-2 py-1 rounded-md text-[11px] bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {t}
            </span>
          ))}
          {item.tags && item.tags.length > 2 && (
            <span className="px-2 py-1 rounded-md text-[11px] bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold leading-snug text-slate-900 dark:text-white">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            <span>{formatRange(start, end)}</span>
          </div>
          {item.location && (
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[12rem]">{item.location}</span>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {item.likeCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {item.commentCount ?? 0}
          </span>

          {/* subtle CTA affordance */}
          <span className="ml-auto text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------- utils ---------------- */
function formatRange(start: Date, end?: Date) {
  const sameDay =
    !!end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const dOpts: Intl.DateTimeFormatOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  const tOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

  if (!end) {
    return `${start.toLocaleDateString(undefined, dOpts)} · ${start.toLocaleTimeString(undefined, tOpts)}`;
  }
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, dOpts)} · ${start.toLocaleTimeString(undefined, tOpts)}–${end.toLocaleTimeString(undefined, tOpts)}`;
  }
  return `${start.toLocaleDateString(undefined, dOpts)} → ${end.toLocaleDateString(undefined, dOpts)}`;
}
