import { useMemo, useState } from "react";
import { ChevronsUpDown, Check, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMembers, useMembersByChurch } from "../../members/hooks/useMembers";

type MemberOption = {
  _id: string;
  label: string;
  sub: string;
};

export default function MemberPicker({
  churchId,
  value,
  onChange,
  disabled,
}: {
  churchId?: string;
  value?: string; // selected memberId
  onChange: (memberId: string) => void;
  disabled?: boolean;
}) {
  // Prefer church-scoped list if we have it
  const listChurch = useMembersByChurch(churchId);
  const listAll = useMembers(); // fallback for safety (won’t be used when churchId exists)

  const loading = (churchId ? listChurch.isLoading : listAll.isLoading) || disabled;
  const membersRaw = (churchId ? listChurch.data : listAll.data) ?? [];

  // Small local search box
  const [q, setQ] = useState("");

  const options: MemberOption[] = useMemo(() => {
    const text = q.trim().toLowerCase();
    const base = membersRaw.map((m) => ({
      _id: m._id,
      label: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "(No name)",
      sub:
        (typeof m.churchId === "object" ? (m.churchId as any)?.name : "") ||
        m.email ||
        m.phone ||
        "",
    }));
    if (!text) return base.slice(0, 200); // cap for perf
    return base
      .filter(
        (o) =>
          o.label.toLowerCase().includes(text) ||
          o.sub.toLowerCase().includes(text)
      )
      .slice(0, 200);
  }, [membersRaw, q]);

  const selected = options.find((o) => o._id === value);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
        Select Member
      </label>

      {/* Search input */}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Loading members…" : "Search by name, email, phone…"}
          className="w-full rounded-lg border bg-white/90 dark:bg-slate-800/70 px-3 py-2 pr-10 border-slate-300/70 dark:border-slate-700 text-sm"
        />
        <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      {/* Result list */}
      <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-slate-900/70">
        {loading ? (
          <div className="p-3 text-sm text-slate-500">Loading…</div>
        ) : options.length === 0 ? (
          <div className="p-3 text-sm text-slate-500">No members found.</div>
        ) : (
          <ul className="divide-y divide-slate-200/60 dark:divide-white/10">
            {options.map((o) => {
              const isActive = o._id === value;
              return (
                <li key={o._id}>
                  <button
                    type="button"
                    onClick={() => onChange(o._id)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50/70 dark:hover:bg-white/5 ${
                      isActive ? "bg-amber-50 dark:bg-amber-400/10" : ""
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {o.label}
                      </div>
                      {o.sub && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {o.sub}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <Check className="ml-auto w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Current selection helper */}
      <AnimatePresence>
        {selected && (
          <motion.p
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="text-[11px] text-slate-500 dark:text-slate-400"
          >
            Selected: <span className="font-medium">{selected.label}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
