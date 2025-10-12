import { CalendarDays, MapPin, Heart, MessageSquare } from "lucide-react";
import type { Event } from "../types/eventTypes";
import { Link } from "react-router-dom";

export default function EventCard({ item, to }: { item: Event; to?: string }) {
  const start = new Date(item.startDate);
  const end = item.endDate ? new Date(item.endDate) : undefined;

  return (
    <Link
      to={to || "#"}
      className="group rounded-2xl overflow-hidden border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 hover:shadow-md transition block"
    >
      {item.coverImageUrl && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="text-xs inline-flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-amber-100/70 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {item.type}
          </span>
          <span className="px-2 py-1 rounded bg-slate-100/70 text-slate-700 dark:bg-white/10 dark:text-slate-300">
            {item.visibility}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="inline-flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            {start.toLocaleString()}
            {end ? ` — ${end.toLocaleString()}` : ""}
          </div>
          {item.location && (
            <div className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {item.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {item.likeCount}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {item.commentCount}</span>
          <div className="flex gap-1 flex-wrap ml-auto">
            {item.tags?.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-slate-100/70 dark:bg-white/10">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
