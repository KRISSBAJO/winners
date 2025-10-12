import { useEffect, useMemo, useRef, useState } from "react";
import {
  Globe2,
  MapPinned,
  Church as ChurchIcon,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNationalList,
  useDistrictsByNational,
  useChurchesByDistrict,
} from "../api/features/org/hooks/useOrg";

type ScopeValue = { nationalId?: string; districtId?: string; churchId?: string };

type Props = {
  value?: ScopeValue;
  onChange: (val: ScopeValue) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function OrgCascader({
  value,
  onChange,
  disabled,
  compact,
  className = "",
}: Props) {
  const [nationalId, setNationalId] = useState<string | undefined>(value?.nationalId);
  const [districtId, setDistrictId] = useState<string | undefined>(value?.districtId);
  const [churchId, setChurchId] = useState<string | undefined>(value?.churchId);

  const { data: nationals = [], isLoading: nLoading } = useNationalList();
  const {
    data: districts = [],
    isLoading: dLoading,
    isError: dError,
  } = useDistrictsByNational(nationalId);
  const {
    data: churches = [],
    isLoading: cLoading,
    isError: cError,
  } = useChurchesByDistrict(districtId);

  // Reset cascading selections
  useEffect(() => {
    if (!nationalId) {
      setDistrictId(undefined);
      setChurchId(undefined);
    }
  }, [nationalId]);

  useEffect(() => {
    if (!districtId) setChurchId(undefined);
  }, [districtId]);

  // ---- SYNC DOWN from parent ----
  useEffect(() => {
    setNationalId(value?.nationalId);
    setDistrictId(value?.districtId);
    setChurchId(value?.churchId);
    // only re-run on scalar changes
  }, [value?.nationalId, value?.districtId, value?.churchId]);

  // ---- PROPAGATE UP to parent (without depending on onChange identity) ----
  const lastSent = useRef<ScopeValue>({});
  useEffect(() => {
    const next = { nationalId, districtId, churchId };
    const prev = lastSent.current;
    if (
      prev.nationalId !== next.nationalId ||
      prev.districtId !== next.districtId ||
      prev.churchId !== next.churchId
    ) {
      lastSent.current = next;
      onChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalId, districtId, churchId]);

  const gridCls = compact ? "grid-cols-3 gap-2" : "grid-cols-1 sm:grid-cols-3 gap-4";

  return (
    <motion.div
      layout
      className={`rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
            style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
          >
            <Globe2 size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Organizational Scope
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter content by National → District → Church
            </p>
          </div>
        </div>

        {/* Selected chips */}
        <div className="hidden md:flex items-center gap-2">
          <ScopeChip
            label=""
            value={nationals.find((n) => n._id === nationalId)?.name}
            onClear={
              disabled || nLoading || !nationalId
                ? undefined
                : () => setNationalId(undefined)
            }
          />
          <ScopeChip
            label=""
            value={districts.find((d) => d._id === districtId)?.name}
            onClear={
              disabled || dLoading || !districtId
                ? undefined
                : () => setDistrictId(undefined)
            }
          />
          <ScopeChip
            label=""
            value={churches.find((c) => c._id === churchId)?.name}
            onClear={
              disabled || cLoading || !churchId ? undefined : () => setChurchId(undefined)
            }
          />
        </div>
      </div>

      {/* Selects */}
      <div className={`grid ${gridCls} p-3 sm:p-4`}>
        <SelectCard
          label="National Church"
          icon={<Globe2 className="w-4 h-4" />}
          loading={nLoading}
          disabled={disabled}
        >
          <NiceSelect
            placeholder="Select national…"
            value={nationalId || ""}
            onChange={(v) => setNationalId(v || undefined)}
            disabled={disabled || nLoading}
            options={nationals.map((n) => ({ label: n.name, value: n._id }))}
          />
        </SelectCard>

        <SelectCard
          label="District"
          icon={<MapPinned className="w-4 h-4" />}
          loading={dLoading}
          disabled={disabled || !nationalId}
          hint={!nationalId ? "Choose a national church first" : undefined}
          error={dError ? "Couldn’t load districts" : undefined}
        >
          <NiceSelect
            placeholder={nationalId ? "Select district…" : "Select national first"}
            value={districtId || ""}
            onChange={(v) => setDistrictId(v || undefined)}
            disabled={disabled || !nationalId || dLoading}
            options={districts.map((d) => ({ label: d.name, value: d._id }))}
          />
        </SelectCard>

        <SelectCard
          label="Church"
          icon={<ChurchIcon className="w-4 h-4" />}
          loading={cLoading}
          disabled={disabled || !districtId}
          hint={!districtId ? "Choose a district first" : undefined}
          error={cError ? "Couldn’t load churches" : undefined}
        >
          <NiceSelect
            placeholder={districtId ? "Select church…" : "Select district first"}
            value={churchId || ""}
            onChange={(v) => setChurchId(v || undefined)}
            disabled={disabled || !districtId || cLoading}
            options={churches.map((c) => ({ label: c.name, value: c._id }))}
          />
        </SelectCard>
      </div>
    </motion.div>
  );
}

/* ---------------------------- Subcomponents ---------------------------- */

function SelectCard({
  label,
  icon,
  loading,
  disabled,
  hint,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className={`rounded-xl border p-3 sm:p-4 transition ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-amber-400/60 hover:shadow-sm"
      } border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2">
          {icon} {label}
        </span>
        <AnimatePresence>
          {loading && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-2 inline-flex items-center gap-1 text-xs text-slate-500"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
      {hint && !error && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </motion.div>
  );
}

function NiceSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const hasValue = Boolean(value);
  const label = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value]
  );

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`peer w-full appearance-none rounded-lg border bg-white/90 dark:bg-slate-800/70 px-3 py-2 pr-9 text-sm text-slate-800 dark:text-slate-100 outline-none ring-2 ring-transparent transition focus:ring-amber-400/40 disabled:opacity-60 disabled:cursor-not-allowed border-slate-300/70 dark:border-slate-700`}
      >
        <option value="">{placeholder || "Select…"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Chevron */}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 peer-focus:text-amber-500" />

      {/* Clear button */}
      <AnimatePresence>
        {hasValue && !disabled && (
          <motion.button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 dark:hover:bg-white/10"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating current value */}
      <AnimatePresence>
        {hasValue && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="mt-2 text-[11px] leading-none text-slate-500 dark:text-slate-400"
          >
            Selected: <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScopeChip({
  label,
  value,
  onClear,
}: {
  label: string;
  value?: string;
  onClear?: () => void;
}) {
  const active = Boolean(value);
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
        active
          ? "border-amber-400/50 bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200"
          : "border-slate-300/60 text-slate-500 dark:border-slate-600"
      }`}
      title={active ? value : undefined}
    >
      <span className="font-medium">{label}</span>
      <span className="max-w-[9rem] truncate">{active ? value : "—"}</span>
      {active && onClear && (
        <button
          onClick={onClear}
          className="ml-1 rounded-full hover:bg-amber-200/50 dark:hover:bg-amber-300/10 p-0.5"
          aria-label={`Clear ${label}`}
          title={`Clear ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
