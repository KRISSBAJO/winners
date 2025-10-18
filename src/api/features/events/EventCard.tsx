

import { Link as RouterLink } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";


/* --------------------------------------------------------------------------
 * Brand tokens (kept in-file for the drop-in demo; consider centralizing)
 * -------------------------------------------------------------------------- */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* Small helper for pretty dates (keeps locale awareness) */
const fmt = (d?: string | Date) =>
  d ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(d)) : "";

// ...
export function EventCard({ item, to }: { item: any; to: string }) {
  // 1) Robust image fallback chain
  const coverUrl =
    item?.coverImageUrl ??
    item?.cover?.url ??
    item?.bannerUrl ??
    item?.imageUrl ??
    item?.images?.[0]?.url ??
    "";

  const date = fmt(item?.startDate);
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const start = item?.startDate ? timeFmt.format(new Date(item.startDate)) : undefined;
  const end = item?.endDate ? timeFmt.format(new Date(item.endDate)) : undefined;
  const time = start ? (end ? `${start} – ${end}` : start) : undefined;

  return (
    <RouterLink
      to={to}
      className="group block overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
    >
      {/* Media */}
      <div className="relative h-44 w-full overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item?.title || "Event cover"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
            <Calendar className="h-7 w-7 text-slate-400" />
          </div>
        )}

        {/* Overlay pill date */}
        {date && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md">
            {date}
          </div>
        )}

        {/* Soft gradient bottom fade for text legibility on images */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Body (unchanged) */}
      <div className="p-4">
        <div className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
          {item?.title || "Untitled Event"}
        </div>
        {item?.subtitle && (
          <div className="mt-0.5 line-clamp-1 text-[13px] text-slate-500 dark:text-slate-400">{item.subtitle}</div>
        )}

        <div className="mt-3 space-y-1.5 text-[13px] text-slate-600 dark:text-slate-300">
          {time && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{time}</span>
            </div>
          )}
          {item?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item?.type && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 dark:border-amber-900/40 dark:bg-amber-400/10 dark:text-amber-300">
              {String(item.type).replace(/([A-Z])/g, " $1").trim()}
            </span>
          )}
          {(item?.tags || []).slice(0, 2).map((t: string) => (
            <span key={t} className="rounded-full border px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300 dark:border-slate-600/60">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <span
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-sm group-hover:shadow"
            style={{ background: GRADIENT }}
          >
            View details
          </span>
        </div>
      </div>
    </RouterLink>
  );
}
