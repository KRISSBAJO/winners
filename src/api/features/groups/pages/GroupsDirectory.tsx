import { useEffect, useMemo, useState } from "react";
import { usePublicGroups, useSubmitJoinRequest } from "../hooks/useGroups";
import type { GroupPublic, GroupType, ObjectId } from "../types/groupTypes";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Calendar,
  X,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Tag as TagIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* Debounce */
function useDebounce<T>(val: T, ms = 350) {
  const [v, setV] = useState(val);
  useEffect(() => {
    const id = setTimeout(() => setV(val), ms);
    return () => clearTimeout(id);
  }, [val, ms]);
  return v;
}

const TYPES: GroupType[] = [
  "cell",
  "ministry",
  "class",
  "prayer",
  "outreach",
  "youth",
  "women",
  "men",
  "seniors",
  "other",
];

export default function GroupsDirectory() {
  /* filters */
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [type, setType] = useState<GroupType | "">("");
  const [limit, setLimit] = useState(12);
  const [activeTag, setActiveTag] = useState<string>("");


  const dq = useDebounce(q, 350);

  // Combine search with selected tag (lets backend match tags via q regex).
  const qCombined = useMemo(() => {
    return [dq, activeTag].filter(Boolean).join(" ");
  }, [dq, activeTag]);

  const { data, isLoading, isFetching } = usePublicGroups({
    page,
    limit,
    q: qCombined || undefined,
    sort: "name",
    type: (type as GroupType) || undefined,
  });

  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;

  // derive popular tags from current page results (top 12 unique)
  const derivedTags = useMemo(() => {
    const all = items.flatMap((g) => g.tags ?? []);
    const map = new Map<string, number>();
    all.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 12);
  }, [items]);

  /* join modal */
  const [joinOpen, setJoinOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupPublic | null>(null);
  const openJoin = (g: GroupPublic) => {
    setActiveGroup(g);
    setJoinOpen(true);
  };
  const closeJoin = () => {
    setJoinOpen(false);
    setActiveGroup(null);
  };

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [qCombined, type, limit]);

  return (
    <section className="relative">
      {/* subtle brand background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80rem 40rem at 50% -10%, rgba(212,175,55,0.07), transparent 60%), radial-gradient(70rem 30rem at 20% 120%, rgba(139,0,0,0.06), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1
            className="font-serif text-slate-900"
            style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)" }}
          >
            Find a Home Fellowship Group
          </h1>
          <p className="mt-1 text-[15px] text-slate-600">
            Discover circles near you to grow, pray, and belong.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search groups by name, subtitle, tags, or area…"
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white/95 outline-none ring-2 ring-transparent focus:ring-amber-400/40"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 md:justify-end">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GroupType | "")}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40 capitalize"
              >
                <option value="">All types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-amber-400/40"
            >
              {[12, 18, 24, 36].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag quick-filters (derived) */}
        {derivedTags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <TagIcon className="h-3.5 w-3.5" /> Popular tags:
            </span>
            <button
              onClick={() => setActiveTag("")}
              className={`rounded-full border px-3 py-1 text-xs ${
                !activeTag
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {derivedTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag((p) => (p === t ? "" : t))}
                className={`rounded-full border px-3 py-1 text-xs ${
                  activeTag === t
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                title={`Filter by “${t}”`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-amber-50 grid place-items-center">
              <Search className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-slate-900 font-semibold">No groups found</h3>
            <p className="text-sm text-slate-600">
              Try adjusting your search, type, or tag filters.
            </p>
          </div>
        )}

        {/* Grid */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(isLoading ? Array.from({ length: limit }) : items).map((g, idx) =>
            isLoading ? (
              <li
                key={`sk-${idx}`}
                className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-200/40 to-transparent"
              >
                <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                  <div className="aspect-[16/9] animate-pulse bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-20 rounded bg-slate-100" />
                    <div className="h-5 w-2/3 rounded bg-slate-100" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-8 w-28 rounded bg-slate-100" />
                  </div>
                </div>
              </li>
            ) : (
              <motion.li
                key={(g as GroupPublic)._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group relative rounded-2xl p-[1px]"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}55, transparent)`,
                  boxShadow: "0 12px 45px -26px rgba(2,19,71,.18)",
                }}
              >
                <article className="rounded-2xl bg-white overflow-hidden shadow-[0_8px_16px_-12px_rgba(2,19,71,0.12)] transition-transform group-hover:-translate-y-0.5">
                  {/* Media */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {(g as GroupPublic).coverUrl ? (
                      <img
                        src={(g as GroupPublic).coverUrl}
                        alt={(g as GroupPublic).name}
                        className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-slate-100">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    {/* gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                    {/* Type ribbon */}
                    <div className="absolute left-3 top-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-md capitalize"
                        style={{ background: BRAND_RED }}
                      >
                        {(g as GroupPublic).type}
                      </span>
                    </div>

                    {/* Bottom overlay meta */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {(g as GroupPublic).publicArea && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] text-white backdrop-blur">
                            <MapPin className="h-3.5 w-3.5" />
                            {(g as GroupPublic).publicArea}
                          </span>
                        )}
                      </div>
                      {typeof (g as GroupPublic).capacity === "number" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] text-white backdrop-blur">
                          <Users className="h-3.5 w-3.5" />
                          {(g as GroupPublic).capacity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">
                        {(g as GroupPublic).name}
                      </h3>
                      <VisibilityPill v={(g as GroupPublic).visibility ?? "members"} />
                    </div>

                    {(g as GroupPublic).description && (
                      <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-600">
                        {(g as GroupPublic).description}
                      </p>
                    )}

                    {/* Tags (up to 3) */}
                    {(g as GroupPublic).tags && (g as GroupPublic).tags!.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(g as GroupPublic).tags!.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
                            title={t}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 text-[12.5px] text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {/* Optional schedule line if you enrich later */}
                        {/* <span>Wednesdays · 7:00 PM</span> */}
                        <span>Open to join</span>
                      </div>

                      <button
                        onClick={() => openJoin(g as GroupPublic)}
                        className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm hover:brightness-[1.06] active:brightness-95 transition"
                        style={{ background: GRADIENT }}
                        aria-label={`Request to join ${(g as GroupPublic).name}`}
                      >
                        Request to Join
                      </button>
                    </div>
                  </div>
                </article>
              </motion.li>
            )
          )}
        </ul>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-7 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Page {data?.page ?? page} of {pages} • {data?.total ?? 0} total
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={page >= pages || isFetching}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Join Modal */}
        <AnimatePresence>
          {joinOpen && activeGroup && (
            <JoinRequestModal
              groupId={activeGroup._id}
              groupName={activeGroup.name}
              onClose={closeJoin}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Small bits ---------- */

function VisibilityPill({ v }: { v: GroupPublic["visibility"] | "members" }) {
  const label = v ?? "members";
  const isPublic = label === "public";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${
        isPublic
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-100 text-slate-700 border border-slate-200"
      }`}
      title={`Visibility: ${label}`}
    >
      <ShieldCheck className={`h-3.5 w-3.5 ${isPublic ? "text-emerald-600" : "text-slate-500"}`} />
      {label}
    </span>
  );
}

/* ------------------- Join Request Modal ------------------- */

function JoinRequestModal({
  groupId,
  groupName,
  onClose,
}: {
  groupId: ObjectId;
  groupName: string;
  onClose: () => void;
}) {
  const submit = useSubmitJoinRequest(groupId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = name.trim().length > 0 && !submit.isPending;

  const phoneClean = phone.replace(/[^\d+]/g, "").trim();

  const send = async () => {
    if (!canSend) return;
    await submit.mutateAsync({
      name: name.trim(),
      email: email.trim() || undefined,
      message: message.trim() || undefined,
      phone: phoneClean || undefined,
    });
    setSent(true);
    setTimeout(onClose, 900);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border bg-white shadow-xl"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-base font-semibold">Request to join</h3>
          <button
            className="rounded-full p-1 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {sent ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-sm">
              Thank you! Your request for <span className="font-medium">{groupName}</span> was sent.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                You’re requesting to join: <span className="font-medium">{groupName}</span>
              </p>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Your name</span>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Email (optional)</span>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  type="email"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Phone number (optional)</span>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  type="tel"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Message (optional)</span>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a short note for the leaders…"
                />
              </label>
            </>
          )}
        </div>

        <div className="p-4 flex items-center justify-end gap-2 border-t">
          <button className="rounded border px-4 py-2" onClick={onClose} disabled={submit.isPending}>
            Close
          </button>
          {!sent && (
            <button
              onClick={send}
              disabled={!canSend}
              className="rounded px-4 py-2 text-white disabled:opacity-60"
              style={{ background: GRADIENT }}
            >
              {submit.isPending ? "Sending…" : "Send request"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
