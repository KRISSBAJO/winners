// src/features/members/components/FiltersDrawer.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, FileDown, Upload, Mail, Calendar, Users, Cake, Heart } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import { useState } from "react";
import { toast } from "sonner";
import {
  useMemberStats, useLeaders, useBirthdays, useAnniversaries,
  useDownloadTemplate, useUploadMembers, useInviteMember,
} from "../hooks/useMembers";
import type { MembershipStatus } from "../types/memberTypes";

export default function FiltersDrawer({
  open, onClose,
  selectedScope, onScopeChange,
  status, onStatusChange,
  month, onMonthChange,
  search, onSearchChange,
}: {
  open: boolean; onClose: () => void;
  selectedScope: { nationalChurchId?: string; districtId?: string; churchId?: string };
  onScopeChange: (v: any) => void;
  status: MembershipStatus | ""; onStatusChange: (v: MembershipStatus | "") => void;
  month: number | ""; onMonthChange: (v: number | "") => void;
  search: string; onSearchChange: (v: string) => void;
}) {
  const stats = useMemberStats();
  const leaders = useLeaders();
  const birthdays = useBirthdays(month || undefined);
  const anniversaries = useAnniversaries(month || undefined);

  const downloadTemplate = useDownloadTemplate();
  const upload = useUploadMembers();
  const invite = useInviteMember();

  const allowChurch = !!selectedScope.churchId;
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div onClick={onClose} className="absolute inset-0 bg-black/40" />
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl p-4 sm:p-5 overflow-y-auto"
            initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Filters & Actions</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium">Organization Scope</label>
              <OrgCascader
                compact
                value={selectedScope}
                onChange={onScopeChange}
                className="text-[13px]"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 mb-5 text-[13px]">
              <Field label="Search">
                <input
                  className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 text-[13px]"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Name, email, phone, church…"
                />
              </Field>

              <Field label="Membership Status">
                <select
                  className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 text-[13px]"
                  value={status}
                  onChange={(e) => onStatusChange(e.target.value as any)}
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Visitor">Visitor</option>
                  <option value="New Convert">New Convert</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>

              <Field label="Birthdays/Anniv. Month (optional)" icon={<Calendar className="w-4 h-4 text-slate-400" />}>
                <select
                  className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 text-[13px]"
                  value={month}
                  onChange={(e) => onMonthChange(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">—</option>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString(undefined, { month: "long" })}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => downloadTemplate.mutate()}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[13px] hover:bg-slate-50/60 dark:hover:bg-white/10"
              >
                <FileDown className="w-4 h-4" /> Download template
              </button>

              <div className="p-3 rounded-lg border text-[13px]">
                <div className="text-sm font-medium mb-2">Bulk upload (XLSX/CSV)</div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-[12px]"
                />
                <button
                  disabled={!allowChurch || !file || upload.isPending}
                  onClick={() => (file ? upload.mutate({ file, churchId: selectedScope.churchId! }) : toast.error("Pick file"))}
                  className="mt-2 w-full px-3 py-2 rounded-lg text-white shadow-md disabled:opacity-60 text-[13px]"
                  style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
                >
                  {upload.isPending ? "Uploading…" : "Upload to church"}
                </button>
                {!allowChurch && (
                  <p className="mt-1 text-[12px] text-slate-500">Pick a church scope first.</p>
                )}
              </div>

              <div className="p-3 rounded-lg border text-[13px]">
                <div className="text-sm font-medium mb-2">Invite member (email)</div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  disabled={!allowChurch || !email || invite.isPending}
                  onClick={() => invite.mutate({ email, churchId: selectedScope.churchId! })}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border"
                >
                  <Mail className="w-4 h-4" /> {invite.isPending ? "Sending…" : "Send invite"}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Stat title="Total" value={stats.data?.total ?? 0} />
              <Stat title="Active" value={stats.data?.active ?? 0} />
              <Stat title="Visitors" value={stats.data?.visitors ?? 0} />
              <Stat title="New" value={stats.data?.converts ?? 0} />
            </div>

            {/* LIVE PANELS */}
            <div className="space-y-3">
              <ListPanel
                title="Leaders"
                icon={<Users className="w-3.5 h-3.5" />}
                loading={leaders.isLoading}
                items={(leaders.data ?? []).map((m) => ({
                  id: m._id,
                  primary: `${m.firstName} ${m.lastName}`,
                  secondary: typeof m.churchId === "object" ? (m as any).churchId?.name : "",
                }))}
                empty="No leaders found."
              />

              <ListPanel
                title={month ? `Birthdays — ${new Date(0, (month as number) - 1).toLocaleString(undefined, { month: "long" })}` : "Birthdays (pick month)"}
                icon={<Cake className="w-3.5 h-3.5" />}
                loading={birthdays.isLoading && !!month}
                items={(birthdays.data ?? []).map((m) => ({
                  id: m._id,
                  primary: `${m.firstName} ${m.lastName}`,
                  secondary: m.dob ? new Date(m.dob).toLocaleDateString() : "",
                }))}
                empty={month ? "No birthdays this month." : "Select a month to view birthdays."}
              />

              <ListPanel
                title={month ? `Anniversaries — ${new Date(0, (month as number) - 1).toLocaleString(undefined, { month: "long" })}` : "Anniversaries (pick month)"}
                icon={<Heart className="w-3.5 h-3.5" />}
                loading={anniversaries.isLoading && !!month}
                items={(anniversaries.data ?? []).map((m) => ({
                  id: m._id,
                  primary: `${m.firstName} ${m.lastName}`,
                  secondary: m.weddingAnniversary ? new Date(m.weddingAnniversary).toLocaleDateString() : "",
                }))}
                empty={month ? "No anniversaries this month." : "Select a month to view anniversaries."}
              />
            </div>

            {/* Footnote */}
            <div className="mt-3 text-[11px] text-slate-500">
              Tips: use the scope to narrow results. Birthdays/Anniversaries load only when a month is selected.
            </div>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        {children}
      </div>
    </label>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md p-2 bg-gradient-to-br from-amber-50 to-white dark:from-white/5 dark:to-transparent border">
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="text-lg font-semibold tabular-nums leading-tight">{value}</div>
    </div>
  );
}

function ListPanel({
  title, icon, items, loading, empty,
}: {
  title: string;
  icon?: React.ReactNode;
  items: { id: string; primary: string; secondary?: string }[];
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs font-semibold flex items-center gap-2 mb-2">
        {icon} {title}
      </div>
      <div className="space-y-1.5 max-h-48 overflow-auto pr-1">
        {loading ? (
          <div className="text-[12px] text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-[12px] text-slate-500">{empty || "No items"}</div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="text-[12.5px] flex items-center justify-between rounded-md border px-2.5 py-1.5 bg-white/80 dark:bg-white/5"
            >
              <div className="truncate">
                <div className="font-medium truncate">{it.primary}</div>
                {it.secondary && (
                  <div className="text-[11px] text-slate-500 truncate">{it.secondary}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
