import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MapPin, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import {
  usePublicGroups,
  useNextOccurrencesPerGroup,
} from "../api/features/groups/hooks/useGroups";
import type { GroupPublic } from "../api/features/groups/types/groupTypes";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* “Wednesday · 7:00 PM” from ISO */
function formatNextTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(d);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(d);
  return `${weekday} · ${time}`;
}

/* Privacy-safe mocks (unchanged) */
const MOCK: Array<
  GroupPublic & { _source?: "mock"; members?: number; time?: string; location?: string; tag?: string }
> = [
  {
    _id: "mock-1",
    type: "other",
    name: "Family Fellowship Night",
    subtitle: "Scripture + meal",
    description: "Scripture, sharing, and a warm meal—bring the kids..",
    coverUrl:
      "https://www.gainesville.com/gcdn/authoring/2010/07/24/NTGS/ghows-LK-c8045ea3-c2b2-461e-9d82-41ab054ee2ed-658334eb.jpeg?width=660&height=415&fit=crop&format=pjpg&auto=webp",
    publicArea: "Eastwood",
    capacity: 25,
    tag: "Family",
    members: 14,
    location: "Eastwood • 123 Faith St",
    time: "Wednesdays · 7:00 PM",
    _source: "mock",
  },
  {
    _id: "mock-2",
    type: "youth",
    name: "Youth Bible Circle",
    description: "Real talk, real faith. Discussion + worship for ages...",
    coverUrl:
      "https://img.apmcdn.org/faf15e58a9def0f838e900b290dc9d5dc63b45ba/uncropped/b2773e-20101207-hc1.jpg",
    publicArea: "Northside",
    tag: "Youth",
    members: 12,
    location: "Northside • 456 Hope Ave",
    time: "Fridays · 6:30 PM",
    _source: "mock",
  },
  {
    _id: "mock-3",
    type: "prayer",
    name: "Women’s Morning Prayer",
    description: "A quiet hour of prayer and encouragement for every...",
    coverUrl:
      "https://campuschurch.com/wp-content/uploads/2021/08/Bible-fellowship-groups-1024x683.jpg",
    publicArea: "West End",
    tag: "Women",
    members: 9,
    location: "West End • 789 Peace Rd",
    time: "Tuesdays · 10:00 AM",
    _source: "mock",
  },
  {
    _id: "mock-4",
    type: "men",
    name: "Men’s Accountability",
    description: "Grow stronger together through scripture and ....",
    coverUrl:
      "https://brandonsdesk.com/wp-content/uploads/2015/11/home-bible-study.jpg?w=640",
    publicArea: "Midtown",
    tag: "Men",
    members: 10,
    location: "Midtown • 101 Unity Ln",
    time: "Thursdays · 7:30 PM",
    _source: "mock",
  },
  {
    _id: "mock-5",
    type: "other",
    name: "Family Devotion Night",
    description: "Whole family devotion time with songs, stories, ...",
    coverUrl:
      "https://www.dispatch.com/gcdn/authoring/2017/05/05/NCOD/ghows-OH-4d4b77d6-449b-2e35-e053-0100007fe439-b6e899fa.jpeg?width=660&height=441&fit=crop&format=pjpg&auto=webp",
    publicArea: "Lovetown",
    tag: "Family",
    members: 20,
    location: "202 Harmony Drive",
    time: "Saturdays · 5:00 PM",
    _source: "mock",
  },
  {
    _id: "mock-6",
    type: "seniors",
    name: "Senior Saints Gathering",
    description: "Fellowship for seniors with wisdom sharing and prayer.",
    coverUrl:
      "https://www.mpnnow.com/gcdn/authoring/2008/03/23/NMP2/ghows-NU-1ed28b99-6cf8-49ed-b1f9-8f98d9a52b20-98761a6f.jpeg?width=660&height=439&fit=crop&format=pjpg&auto=webp",
    publicArea: "Peacetown",
    tag: "Seniors",
    members: 14,
    location: "303 Grace Boulevard",
    time: "Mondays · 2:00 PM",
    _source: "mock",
  },
];

/**
 * Keep your original fill rule:
 * - If API total >= 6 → first 6 API; showMore = totalApi > 6
 * - If 1..5 API → all API + mocks to reach 6
 * - If 0 API → 6 mocks
 */
function selectHomeItems(apiItems: GroupPublic[], totalApi: number) {
  const toApiCard = (g: GroupPublic) => ({
    ...g,
    _source: "api" as const,
    tag: g.type ? g.type.charAt(0).toUpperCase() + g.type.slice(1) : undefined,
    location: g.publicArea,
  });

  const api = (apiItems ?? []).map(toApiCard);
  const showMore = totalApi > 6;

  if (api.length >= 6) {
    return { items: api.slice(0, 6), showMore, moreCount: Math.max(0, totalApi - 6) };
  }

  if (api.length > 0) {
    const needed = 6 - api.length;
    const filler = MOCK.slice(0, needed);
    return { items: [...api, ...filler], showMore: false, moreCount: 0 };
  }

  // no API at all
  return { items: MOCK.slice(0, 6), showMore: false, moreCount: 0 };
}

/** Rotation that ONLY runs when there are ≥ 6 API groups. */
function useRotatingApiWindow(fullApi: any[], enabled: boolean, step = 3, intervalMs = 30000) {
  const [offset, setOffset] = React.useState(0);
  const shuffledRef = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (!enabled) { shuffledRef.current = []; setOffset(0); return; }
    const copy = [...fullApi];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    shuffledRef.current = copy;
    setOffset(0);
  }, [enabled, fullApi]);

  React.useEffect(() => {
    if (!enabled || shuffledRef.current.length < 6) return;
    const id = setInterval(() => setOffset(o => (o + step) % shuffledRef.current.length), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, step]);

  return React.useMemo(() => {
    if (!enabled || shuffledRef.current.length < 6) return [];
    const arr = shuffledRef.current;
    return Array.from({ length: 6 }, (_, i) => arr[(offset + i) % arr.length]);
  }, [enabled, offset]);
}

export default function HomeFellowshipCompact() {
  const { data } = usePublicGroups({ page: 1, limit: 24, sort: "name" });
  const apiItems = data?.items ?? [];
  const totalApi = data?.total ?? 0;

  // Your original 6-card selection (API first, then fill with mocks)
  const { items: baseItems, showMore, moreCount } = useMemo(
    () => selectHomeItems(apiItems, totalApi),
    [apiItems, totalApi]
  );

  // Build pure-API array (for rotation only)
  const fullApi = useMemo(
    () => (data?.items ?? []).map(g => ({
      ...g,
      _source: "api" as const,
      tag: g.type ? g.type.charAt(0).toUpperCase() + g.type.slice(1) : undefined,
      location: g.publicArea,
    })),
    [data?.items]
  );

  // Rotate ONLY when there are ≥ 6 API results overall
  const canRotate = totalApi >= 6;
  const rotatingSix = useRotatingApiWindow(fullApi, canRotate, /*step*/ 3, /*interval*/ 30000);

  // Final items: rotate when possible, otherwise keep your original mixed set
  const items = (canRotate && rotatingSix.length === 6) ? rotatingSix : baseItems;

  // Only ask for next times for API-backed cards currently displayed
  const apiIds = useMemo(
    () => items.filter((it: any) => it._source === "api").map((it: any) => it._id),
    [items]
  );
  const { data: nextMap } = useNextOccurrencesPerGroup(apiIds);

  return (
    <section className="py-12 sm:py-14 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-7 text-center">
          <h2
            className="font-serif text-slate-900"
            style={{ fontSize: "clamp(1.4rem,3.5vw,2.2rem)" }}
          >
            Home Fellowship Groups
          </h2>
          <p className="mt-1 text-[15px] text-slate-600">
            Find a nearby circle to grow, pray, and belong.
          </p>
        </div>

        {/* Grid */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((g: any) => {
            const isApi = g._source === "api";
            const nextISO = isApi ? nextMap?.[g._id]?.startAt : undefined;
            const nextText = formatNextTime(nextISO);

            return (
              <motion.li
                key={g._id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="group relative rounded-2xl p-[1px] transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}, rgba(212,175,55,0))`,
                  boxShadow: "0 14px 44px -24px rgba(2,19,71,.28)",
                }}
              >
                <article className="rounded-2xl bg-white overflow-hidden">
                  {/* Media */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {g.coverUrl ? (
                      <img
                        src={g.coverUrl}
                        alt={g.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-slate-100">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      {g.type && (
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-md"
                          style={{ background: BRAND_RED }}
                        >
                          {g.tag ?? g.type}
                        </span>
                      )}
                      {g.publicArea && (
                        <span className="rounded-full bg-white/90 text-slate-800 px-2.5 py-1 text-[11px] shadow">
                          {g.publicArea}
                        </span>
                      )}
                    </div>
                    {typeof g.capacity === "number" && (
                      <div className="absolute right-3 top-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-slate-800 shadow">
                          <Shield className="h-3.5 w-3.5" /> {g.capacity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">{g.name}</h3>
                      {g.members && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                          <Users className="h-3.5 w-3.5" />
                          {g.members}
                        </span>
                      )}
                    </div>

                    {g.subtitle && <p className="mt-0.5 text-[12.5px] text-slate-500">{g.subtitle}</p>}
                    {g.description && (
                      <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-600">{g.description}</p>
                    )}

                    <div className="mt-3 space-y-1.5 text-[12.5px] text-slate-600">
                      {g.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{g.location}</span>
                        </div>
                      )}
                      {nextText && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{nextText}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to="/groups"
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-800 hover:text-slate-900"
                        aria-label={`View ${g.name}`}
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      {isApi ? (
                        <Link
                          to="/groups"
                          className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm hover:brightness-[1.05] transition"
                          style={{ background: GRADIENT }}
                          aria-label={`Join ${g.name}`}
                        >
                          Join Group
                        </Link>
                      ) : (
                        <button
                          type="button"
                          title="Sample group for illustration"
                          className="inline-flex cursor-not-allowed items-center justify-center rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-white/80 shadow-sm"
                          style={{ background: GRADIENT, filter: "grayscale(30%)", opacity: 0.8 }}
                          aria-disabled="true"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </motion.ul>

        {showMore && (
          <div className="text-center mt-8">
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-[1.05] transition"
              style={{ background: GRADIENT }}
            >
              View more groups ({moreCount})
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
