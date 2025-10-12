import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2, Plus, Pencil, Trash2, Upload, FileDown, Mail, Search, Filter, X,
  Calendar, Cake, Shield, Download, AtSign, Phone, MapPin, Building2
} from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import {
  useMembers,
  useMembersByChurch,
  useMembersByDistrict,
  useMembersByNational,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  useMemberStats,
  useLeaders,
  useBirthdays,
  useAnniversaries,
  useUploadMembers,
  useDownloadTemplate,
  useInviteMember,
  useRegisterMemberWithToken,
} from "../hooks/useMembers";
import type { Member, CreateMemberInput, UpdateMemberInput, MembershipStatus } from "../types/memberTypes";
import { toast } from "sonner";

/* ======================================================================================
   PAGE
====================================================================================== */

export default function MembershipManagement() {
  const { scope, setScope, user } = useAuthStore();

  // query filters
  const [status, setStatus] = useState<MembershipStatus | "">("");
  const [month, setMonth] = useState<number | "">("");

  // scoping (national -> district -> church) via OrgCascader
  const [selectedScope, setSelectedScope] = useState(scope);
  useEffect(() => setScope(selectedScope), [selectedScope, setScope]);

  // decide source: by church / district / national / global
  const enableChurch = !!selectedScope.churchId;
  const enableDistrict = !!selectedScope.districtId && !selectedScope.churchId;
  const enableNational = !!selectedScope.nationalChurchId && !selectedScope.districtId && !selectedScope.churchId;

  const baseList = useMembers(status ? { membershipStatus: status } : undefined);
  const byChurch = useMembersByChurch(enableChurch ? selectedScope.churchId : undefined);
  const byDistrict = useMembersByDistrict(enableDistrict ? selectedScope.districtId : undefined);
  const byNational = useMembersByNational(enableNational ? selectedScope.nationalChurchId : undefined);

  const isLoading =
    baseList.isLoading || byChurch.isLoading || byDistrict.isLoading || byNational.isLoading;

  const error =
    (baseList.isError && baseList.error) ||
    (byChurch.isError && byChurch.error) ||
    (byDistrict.isError && byDistrict.error) ||
    (byNational.isError && byNational.error);

  const dataRaw: Member[] = useMemo(() => {
    if (enableChurch) return byChurch.data ?? [];
    if (enableDistrict) return byDistrict.data ?? [];
    if (enableNational) return byNational.data ?? [];
    return baseList.data ?? [];
  }, [enableChurch, enableDistrict, enableNational, byChurch.data, byDistrict.data, byNational.data, baseList.data]);

  const [search, setSearch] = useState("");
  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dataRaw;
    return dataRaw.filter((m) =>
      [
        m.firstName, m.middleName, m.lastName, m.email, m.phone,
        typeof m.churchId === "object" ? m.churchId?.name : "",
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [dataRaw, search]);

  return (
    <div className="space-y-6">
      <HeaderBar />

      {/* Scope + Filters */}
      <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-slate-200/70 dark:border-white/10 p-4 space-y-4">
      <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Organization Scope</label>
            <OrgCascader value={selectedScope} onChange={setSelectedScope} />
          </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
            <Select
              label="Membership Status"
              value={status}
              onChange={(v) => setStatus(v as MembershipStatus | "")}
              options={[
                { label: "All", value: "" },
                { label: "Active", value: "Active" },
                { label: "Visitor", value: "Visitor" },
                { label: "New Convert", value: "New Convert" },
                { label: "Inactive", value: "Inactive" },
              ]}
              icon={<Filter className="w-4 h-4 text-slate-400" />}
            />
            <MonthSelect label="Birthdays/Anniv. Month (optional)" value={month} onChange={setMonth} />
            <SearchBox value={search} onChange={setSearch} />
            <ActionButtons selectedScope={selectedScope} />
          </div>
        </div>

        <StatsAndQuickLists month={month || undefined} />
      </div>

      {/* List + CRUD */}
      <MembersSection members={data} isLoading={isLoading} error={error as any} selectedScope={selectedScope} />
    </div>
  );
}

/* ======================================================================================
   HEADER
====================================================================================== */

function HeaderBar() {
  return (
    <div className="flex items-center justify-between">
      <div>
         <h1 className="text-2xl font-extrabold flex gap-2 text-slate-900 dark:text-white tracking-tight">
          <Users2 className="w-5 h-5 text-amber-600" /> Membership Management
        </h1>
        <p className="text-sm text-slate-500">Manage members, leaders, uploads, and invitations.</p>
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <Building2 className="w-4 h-4" />
        <span>Dominion Connect</span>
      </div>
    </div>
  );
}

/* ======================================================================================
   FILTERS / HELPERS
====================================================================================== */

function Select({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string | number | "";
  onChange: (val: string) => void;
  options: Array<{ label: string; value: string | number }>;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        <select
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={String(o.value)} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function MonthSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  const months = [
    { label: "—", value: "" },
    ...Array.from({ length: 12 }).map((_, i) => ({
      label: new Date(0, i).toLocaleString(undefined, { month: "long" }),
      value: i + 1,
    })),
  ];
  return (
    <Select
      label={label}
      value={value}
      onChange={(v) => onChange(v === "" ? "" : Number(v))}
      options={months}
      icon={<Calendar className="w-4 h-4 text-slate-400" />}
    />
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">Search</span>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          placeholder="Name, email, phone, church…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function ActionButtons({ selectedScope }: { selectedScope: { nationalId?: string; districtId?: string; churchId?: string } }) {
  const downloadTemplate = useDownloadTemplate();
  const upload = useUploadMembers();
  const invite = useInviteMember();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const allowUpload = !!selectedScope.churchId; // upload requires churchId
  const allowInvite = !!selectedScope.churchId;

  return (
    <div className="grid grid-cols-2 gap-2 mt-6 md:mt-0">
      <button
        onClick={() => downloadTemplate.mutate()}
        className="px-3 py-2 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10 inline-flex items-center gap-2 justify-center"
      >
        <FileDown className="w-4 h-4" /> Template
      </button>
      <button
        disabled={!allowUpload}
        onClick={() => (allowUpload ? setUploadOpen(true) : toast.error("Pick a church to upload into"))}
        className="px-3 py-2 rounded-lg text-white shadow-md inline-flex items-center gap-2 justify-center disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
      >
        <Upload className="w-4 h-4" /> Upload
      </button>

      <button
        disabled={!allowInvite}
        onClick={() => (allowInvite ? setInviteOpen(true) : toast.error("Pick a church to invite into"))}
        className="col-span-2 px-3 py-2 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10 inline-flex items-center gap-2 justify-center"
      >
        <Mail className="w-4 h-4" /> Invite
      </button>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        churchId={selectedScope.churchId}
        onConfirm={async (file) => upload.mutate({ file, churchId: selectedScope.churchId! })}
        loading={upload.isPending}
      />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        churchId={selectedScope.churchId}
        onConfirm={(email) => invite.mutate({ email, churchId: selectedScope.churchId! })}
        loading={invite.isPending}
      />
    </div>
  );
}

/* ======================================================================================
   STATS / QUICK LISTS
====================================================================================== */

function StatsAndQuickLists({ month }: { month?: number }) {
  const stats = useMemberStats();
  const leaders = useLeaders();
  const birthdays = useBirthdays(month);
  const anniversaries = useAnniversaries(month);

  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <StatCard title="Total Members" value={stats.data?.total ?? 0} />
      <StatCard title="Active" value={stats.data?.active ?? 0} />
      <StatCard title="Visitors" value={stats.data?.visitors ?? 0} />
      <StatCard title="New Converts" value={stats.data?.converts ?? 0} />

      <QuickList
        title="Leaders"
        icon={<Shield className="w-4 h-4" />}
        loading={leaders.isLoading}
        items={(leaders.data ?? []).map((m: Member) => ({
          id: m._id,
          primary: `${m.firstName} ${m.lastName}`,
          secondary: (m as any).churchId?.name ?? "",
        }))}
      />

      <QuickList
        title={month ? `Birthdays in ${new Date(0, month - 1).toLocaleString(undefined, { month: "long" })}` : "Birthdays (select month)"}
        icon={<Cake className="w-4 h-4" />}
        loading={birthdays.isLoading}
        items={(birthdays.data ?? []).map((m: Member) => ({
          id: m._id,
          primary: `${m.firstName} ${m.lastName}`,
          secondary: m.dob ? new Date(m.dob).toLocaleDateString() : "",
        }))}
      />

      <QuickList
        title={month ? `Anniversaries in ${new Date(0, month - 1).toLocaleString(undefined, { month: "long" })}` : "Anniversaries (select month)"}
        icon={<Calendar className="w-4 h-4" />}
        loading={anniversaries.isLoading}
        items={(anniversaries.data ?? []).map((m: Member) => ({
          id: m._id,
          primary: `${m.firstName} ${m.lastName}`,
          secondary: m.weddingAnniversary ? new Date(m.weddingAnniversary).toLocaleDateString() : "",
        }))}
      />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-white dark:from-white/5 dark:to-transparent border border-slate-200/70 dark:border-white/10">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function QuickList({
  title,
  icon,
  items,
  loading,
}: {
  title: string;
  icon?: React.ReactNode;
  items: Array<{ id: string; primary: string; secondary?: string }>;
  loading?: boolean;
}) {
  return (
    <div className="lg:col-span-2 rounded-xl p-4 bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10">
      <div className="text-sm font-medium flex items-center gap-2 mb-3">
        {icon} {title}
      </div>
      <div className="space-y-2 max-h-52 overflow-auto pr-1">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-500">No data</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="text-sm flex items-center justify-between rounded-lg border px-3 py-2 bg-white/80 dark:bg-white/5">
              <div>
                <div className="font-medium">{it.primary}</div>
                {it.secondary && <div className="text-xs text-slate-500">{it.secondary}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ======================================================================================
   MEMBERS LIST + CRUD
====================================================================================== */

function MembersSection({
  members,
  isLoading,
  error,
  selectedScope,
}: {
  members: Member[];
  isLoading: boolean;
  error?: any;
  selectedScope: { nationalId?: string; districtId?: string; churchId?: string };
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const startCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const startEdit = (m: Member) => {
    setEditing(m);
    setOpen(true);
  };

  const remove = useDeleteMember();

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/70 border-slate-200/70 dark:border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-slate-600 dark:text-slate-300">{members.length} result(s)</div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white shadow-md"
          style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
        >
          <Plus className="w-4 h-4" /> New Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Church</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={5}>Loading…</td></tr>
            )}
            {!isLoading && error && (
              <tr><td className="px-4 py-6 text-center text-red-500" colSpan={5}>{String(error?.message || "Failed to load")}</td></tr>
            )}
            {!isLoading && !error && members.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={5}>No members found.</td></tr>
            )}
            {members.map((m) => (
              <tr key={m._id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-slate-500">{m.middleName}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    {m.email && (<span className="inline-flex items-center gap-1"><AtSign className="w-3.5 h-3.5" />{m.email}</span>)}
                    {m.phone && (<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{m.phone}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {typeof m.churchId === "object" ? (m.churchId as any)?.name : ""}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs">{m.membershipStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/dashboard/edit-member/${m._id}`} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">
                     
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (!confirm("Delete this member?")) return;
                        remove.mutate(m._id);
                      }}
                      className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MemberModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        selectedScope={selectedScope}
      />
    </div>
  );
}

/* ======================================================================================
   MODALS
====================================================================================== */

function MemberModal({
  open,
  onClose,
  editing,
  selectedScope,
}: {
  open: boolean;
  onClose: () => void;
  editing: Member | null;
  selectedScope: { churchId?: string };
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<Partial<CreateMemberInput & UpdateMemberInput>>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    membershipStatus: "Active",
    churchId: selectedScope.churchId,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        firstName: editing.firstName,
        middleName: editing.middleName,
        lastName: editing.lastName,
        email: editing.email,
        phone: editing.phone,
        membershipStatus: editing.membershipStatus,
        churchId: typeof editing.churchId === "string" ? editing.churchId : (editing.churchId as any)?._id,
      });
    } else {
      setForm((p) => ({ ...p, churchId: selectedScope.churchId }));
    }
  }, [editing, selectedScope.churchId]);

  const create = useCreateMember();
  const update = useUpdateMember(editing?._id ?? "");

  const submitting = create.isPending || update.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await update.mutateAsync(form);
        toast.success("Member updated");
      } else {
        if (!form.churchId) return toast.error("Pick a church (scope) to create into.");
        await create.mutateAsync(form as CreateMemberInput);
        toast.success("Member created");
      }
      onClose();
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.form
            onSubmit={submit}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{isEdit ? "Edit Member" : "New Member"}</h3>
              <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="First Name" value={form.firstName ?? ""} onChange={(v) => setForm((p) => ({ ...p, firstName: v }))} />
              <TextField label="Last Name" value={form.lastName ?? ""} onChange={(v) => setForm((p) => ({ ...p, lastName: v }))} />
              <TextField label="Middle Name" value={form.middleName ?? ""} onChange={(v) => setForm((p) => ({ ...p, middleName: v }))} />
              <TextField label="Email" value={form.email ?? ""} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
              <TextField label="Phone" value={form.phone ?? ""} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
              <Select
                label="Status"
                value={form.membershipStatus ?? "Active"}
                onChange={(v) => setForm((p) => ({ ...p, membershipStatus: v as MembershipStatus }))}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Visitor", value: "Visitor" },
                  { label: "New Convert", value: "New Convert" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
              >
                {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function UploadModal({
  open,
  onClose,
  churchId,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  churchId?: string;
  onConfirm: (file: File) => void;
  loading?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bulk Upload Members</h3>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              {churchId ? `Target church: ${churchId}` : "Please pick a church in the scope."}
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
            />

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10">Cancel</button>
              <button
                onClick={() => (file ? onConfirm(file) : toast.error("Select a file first"))}
                disabled={!file || loading}
                className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
              >
                {loading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InviteModal({
  open,
  onClose,
  churchId,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  churchId?: string;
  onConfirm: (email: string) => void;
  loading?: boolean;
}) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) setEmail("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invite Member</h3>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              {churchId ? `Invites will register into church: ${churchId}` : "Pick a church in the scope first."}
            </p>

            <TextField label="Email" value={email} onChange={setEmail} />
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10">Cancel</button>
              <button
                onClick={() => (email ? onConfirm(email) : toast.error("Enter an email"))}
                disabled={!email || loading}
                className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
              >
                {loading ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ======================================================================================
   UI PRIMS
====================================================================================== */

function TextField({
  label,
  value,
  onChange,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:ring-2 focus:ring-amber-500/30`}
        />
      </div>
    </label>
  );
}
