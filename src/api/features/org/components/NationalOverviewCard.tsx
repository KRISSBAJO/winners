// src/api/features/org/components/NationalOverviewCard.tsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Map,
  Church as ChurchIcon,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useNationalOverview } from "../hooks/useOrg";

type Props = { nationalId: string };

export default function NationalOverviewCard({ nationalId }: Props) {
  // 🔒 Always call hooks in the same order
  const { data, isLoading, isError, error, refetch, isFetching } =
    useNationalOverview(nationalId);
  const [query, setQuery] = useState("");

  // Provide safe defaults so we can still call useMemo unconditionally
  const info = data?.info ?? null;
  const totals = data?.totals ?? { districts: 0, churches: 0, pastors: 0 };
  const districts = data?.districts ?? [];

  const filteredDistricts = useMemo(() => {
    if (!query.trim()) return districts;
    const q = query.toLowerCase();
    return districts.filter(
      (d: any) =>
        [d.name, d.code, d.districtPastor]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)) ||
        (d.churches ?? []).some((c: any) =>
          [c.name, c.churchId, c.pastor]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
    );
  }, [districts, query]);

  // JSX branching happens after hooks
  if (isLoading) return <CardSkeleton />;
  if (isError) return <ErrorCard message={(error as any)?.message} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Building2 className="w-4 h-4" />
            <span>National Church</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{info?.name ?? "—"}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge>Code: {info?.code ?? "—"}</Badge>
            {info?.nationalPastor && <Badge tone="amber">Pastor: {info.nationalPastor}</Badge>}
            {info?.address?.country && <Badge tone="slate">{info.address.country}</Badge>}
          </div>
        </div>

        <CopyButton value={info?.code ?? ""} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat
          label="Districts"
          value={totals.districts}
          icon={<Map className="w-4 h-4" />}
          gradient="from-amber-50 to-white dark:from-white/5 dark:to-transparent"
        />
        <Stat
          label="Churches"
          value={totals.churches}
          icon={<ChurchIcon className="w-4 h-4" />}
          gradient="from-red-50 to-white dark:from-white/5 dark:to-transparent"
        />
        <Stat
          label="Pastors"
          value={totals.pastors}
          icon={<CheckCircle2 className="w-4 h-4" />}
          gradient="from-emerald-50 to-white dark:from-white/5 dark:to-transparent"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          placeholder="Search districts or churches…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:ring-2 focus:ring-amber-500/30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-3 top-2.5 text-xs text-slate-400">
          {isFetching ? "Refreshing…" : null}
        </div>
      </div>

      {/* Districts accordion */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredDistricts.map((d: any) => (
            <Accordion key={d._id} header={<DistrictHeader d={d} />}>
              <ul className="mt-3 space-y-2">
                {(d.churches ?? []).length === 0 && (
                  <li className="text-sm text-slate-500">No churches yet.</li>
                )}
                {(d.churches ?? []).map((c: any) => (
                  <li
                    key={c._id}
                    className="text-sm rounded-lg border border-slate-200/60 dark:border-white/10 p-3 flex items-start justify-between hover:bg-slate-50/60 dark:hover:bg-white/5 transition"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        Code: <span className="tabular-nums">{c.churchId}</span>
                        {c.pastor ? ` • Pastor: ${c.pastor}` : ""}
                      </div>
                      {(c.contactEmail || c.contactPhone) && (
                        <div className="text-xs text-slate-500">
                          {c.contactEmail ? c.contactEmail : ""}
                          {c.contactEmail && c.contactPhone ? " • " : ""}
                          {c.contactPhone ? c.contactPhone : ""}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {c.address?.city || c.address?.state || c.address?.country
                        ? [c.address?.city, c.address?.state, c.address?.country].filter(Boolean).join(", ")
                        : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </AnimatePresence>

        {filteredDistricts.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-8">No results found.</div>
        )}
      </div>
    </div>
  );
}

/* ---------- Pieces (unchanged) ---------- */

function Badge({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "slate" | "red" | "emerald";
}) {
  const map: Record<string, string> = {
    amber: "bg-amber-100/70 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    slate: "bg-slate-100/70 text-slate-700 dark:bg-white/10 dark:text-slate-300",
    red: "bg-red-100/70 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    emerald: "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${map[tone]}`}>{children}</span>;
}

function Stat({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div
      layout
      className={`rounded-xl p-4 bg-gradient-to-br ${gradient} border border-slate-200/60 dark:border-white/10`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value ?? 0}</div>
      <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37]"
          style={{ width: `${Math.min(100, (value || 0) * 10)}%` }}
        />
      </div>
    </motion.div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value);

  const copy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      onClick={copy}
      disabled={!canCopy}
      className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10 disabled:opacity-50"
    >
      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied" : "Copy Code"}
    </button>
  );
}

function DistrictHeader({ d }: { d: any }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="space-y-0.5">
        <div className="font-medium">{d.name}</div>
        <div className="text-xs text-slate-500">
          Code: <span className="tabular-nums">{d.code}</span>
          {d.districtPastor ? ` • Pastor: ${d.districtPastor}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="slate">{d.churchCount ?? (d.churches?.length ?? 0)} churches</Badge>
      </div>
    </div>
  );
}

function Accordion({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5"
    >
      <button
        className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-white/10 rounded-xl"
        onClick={() => setOpen((v) => !v)}
      >
        {header}
        <motion.span initial={false} animate={{ rotate: open ? 90 : 0 }} className="ml-3 text-slate-400">
          ▶
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-200/70 dark:bg-white/10 rounded" />
        <div className="h-6 w-56 bg-slate-200/70 dark:bg-white/10 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-24 bg-slate-200/70 dark:bg-white/10 rounded" />
          <div className="h-5 w-28 bg-slate-200/70 dark:bg-white/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 border bg-white/70 dark:bg-white/5">
            <div className="h-3 w-16 bg-slate-200/70 dark:bg-white/10 rounded mb-2" />
            <div className="h-6 w-10 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="h-1.5 w-full bg-slate-200/70 dark:bg-white/10 rounded mt-3" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-200/60 dark:bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl p-6 bg-white/85 dark:bg-slate-900/70 border border-red-200 dark:border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="font-semibold mb-1">Couldn’t load overview</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {message || "An unexpected error occurred."}
          </p>
          <button
            onClick={onRetry}
            className="mt-3 text-sm px-3 py-2 rounded-md border border-slate-200/70 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
