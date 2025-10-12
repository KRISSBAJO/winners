import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  UserPlus,
  Crown,
  Info,
  Building2,
  Map,
  Church as ChurchIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useNationalList, useDistrictsByNational, useChurchesByDistrict } from "../../../../api/features/org/hooks/useOrg";
import { useMembersByChurch } from "../../members/hooks/useMembers";
import {
  useGroupsByChurch,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useAssignLeader,
} from "../hooks/useVolunteerGroups";

type GroupForm = {
  churchId: string;
  name: string;
  description?: string;
  leaderId?: string | null;
};

export default function VolunteerGroupsPage() {
  // ---- Filters
  const { data: nationals = [] } = useNationalList();
  const [nationalId, setNationalId] = useState("");
  const { data: districts = [] } = useDistrictsByNational(nationalId || undefined);
  const [districtId, setDistrictId] = useState("");
  const { data: churches = [] } = useChurchesByDistrict(districtId || undefined);
  const [churchId, setChurchId] = useState("");

  // ---- Data
  const { data: groups = [], isLoading } = useGroupsByChurch(churchId || undefined);
  const { data: members = [] } = useMembersByChurch(churchId || undefined);

  // ---- Mutations
  const createMut = useCreateGroup();
  const updateMut = useUpdateGroup(); 
  const deleteMut = useDeleteGroup();
  const addMemberMut = useAddGroupMember();
  const removeMemberMut = useRemoveGroupMember();
  const assignLeaderMut = useAssignLeader();

  // ---- Local UI state
  const [q, setQ] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [form, setForm] = useState<GroupForm>({ churchId: "", name: "", description: "" });

  // keep churchId in form in sync
  useEffect(() => {
    setForm((p) => ({ ...p, churchId: churchId || "" }));
  }, [churchId]);

  const filteredGroups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter((g: any) =>
      [g.name, g.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
    );
  }, [groups, q]);

  const selectedGroup = useMemo(() => groups.find((g: any) => g._id === drawerId), [groups, drawerId]);

  // ---- Actions
  const startCreate = () => {
    if (!churchId) return toast.error("Select a church first.");
    setEditingId(null);
    setForm({ churchId, name: "", description: "", leaderId: null });
    setOpenModal(true);
  };

  const startEdit = (row: any) => {
    setEditingId(row._id);
    setForm({
      churchId: row.churchId,
      name: row.name,
      description: row.description ?? "",
      leaderId: row.leaderId ?? null,
    });
    setOpenModal(true);
  };

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
    if (!form.churchId) return toast.error("Church is required");
    if (!form.name?.trim()) return toast.error("Name is required");

    try {
        if (editingId) {
        await updateMut.mutateAsync({
            id: editingId,
            data: {
            name: form.name.trim(),
            description: form.description || "",
            leaderId: form.leaderId ?? undefined,
            },
        });
        } else {
        await createMut.mutateAsync({
            churchId: form.churchId,
            name: form.name.trim(),
            description: form.description,
        });
        }
        setOpenModal(false);
    } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Operation failed");
    }
    };


  const removeGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    try {
      await deleteMut.mutateAsync(id);
      if (drawerId === id) setDrawerId(null);
    } catch {}
  };

  const addMember = async (groupId: string, memberId: string) => {
    try {
      await addMemberMut.mutateAsync({ groupId, memberId });
    } catch {}
  };

  const removeMember = async (groupId: string, memberId: string) => {
    try {
      await removeMemberMut.mutateAsync({ groupId, memberId });
    } catch {}
  };

  const assignLeader = async (groupId: string, leaderId: string) => {
    try {
      await assignLeaderMut.mutateAsync({ groupId, leaderId });
    } catch {}
  };

  // ---- Parent filter change resets
  const onNationalChange = (id: string) => {
    setNationalId(id);
    setDistrictId("");
    setChurchId("");
  };
  const onDistrictChange = (id: string) => {
    setDistrictId(id);
    setChurchId("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" /> Volunteer Groups
          </h1>
          <p className="text-sm text-slate-500">Create teams, manage members, and assign leaders.</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md disabled:opacity-60"
          disabled={!churchId}
          style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
        >
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
          value={nationalId}
          onChange={onNationalChange}
          options={[
            { label: "Select national…", value: "" },
            ...nationals.map((n: any) => ({ label: n.name, value: n._id })),
          ]}
        />
        <Select
          icon={<Map className="w-4 h-4 text-slate-400" />}
          value={districtId}
          onChange={onDistrictChange}
          disabled={!nationalId}
          options={[
            { label: nationalId ? "Select district…" : "Select national first", value: "" },
            ...districts.map((d: any) => ({ label: d.name, value: d._id })),
          ]}
        />
        <Select
          icon={<ChurchIcon className="w-4 h-4 text-slate-400" />}
          value={churchId}
          onChange={setChurchId}
          disabled={!districtId}
          options={[
            { label: districtId ? "Select church…" : "Select district first", value: "" },
            ...churches.map((c: any) => ({ label: c.name, value: c._id })),
          ]}
        />
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
            placeholder="Search groups…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Leader</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Loading…</td></tr>
              )}
              {!isLoading && filteredGroups.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No groups.</td></tr>
              )}
              {filteredGroups.map((g: any) => (
                <tr key={g._id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                  <td className="px-4 py-3">
                    <button className="font-medium hover:underline" onClick={() => setDrawerId(g._id)}>
                      {g.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">{g.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Crown className="w-4 h-4 text-amber-500" />
                      {renderMemberName(members, g.leaderId) || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{g.members?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(g)} className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeGroup(g._id)} className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={submit}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{editingId ? "Edit Group" : "Create Group"}</h3>
                <button type="button" onClick={() => setOpenModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <Text label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <TextArea label="Description" value={form.description || ""} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={3} />
                <Select
                  label="Leader (optional)"
                  value={form.leaderId || ""}
                  onChange={(v) => setForm((p) => ({ ...p, leaderId: v || null }))}
                  options={[
                    { label: "— None —", value: "" },
                    ...members.map((m: any) => ({ label: `${m.firstName} ${m.lastName}`, value: m._id })),
                  ]}
                />
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Leader must belong to this church.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpenModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
                >
                  {editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerId && selectedGroup && (
          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-white/10 p-6 overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Group
                </div>
                <h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
              </div>
              <button onClick={() => setDrawerId(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-6">
              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-1">Description</div>
                <div className="text-sm">{selectedGroup.description || "—"}</div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Leader</div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">
                    {renderMemberName(members, selectedGroup.leaderId) || "—"}
                  </span>
                </div>
                <div className="mt-2">
                  <Select
                    value={selectedGroup.leaderId || ""}
                    onChange={(v) => assignLeader(selectedGroup._id, v)}
                    options={[
                      { label: "— None —", value: "" },
                      ...members.map((m: any) => ({ label: `${m.firstName} ${m.lastName}`, value: m._id })),
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Members</div>
                {(selectedGroup.members || []).length === 0 ? (
                  <div className="text-sm text-slate-500">No members yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {selectedGroup.members.map((mid: string) => (
                      <li key={mid} className="flex items-center justify-between text-sm rounded-lg border p-2">
                        <span>{renderMemberName(members, mid) || mid}</span>
                        <button
                          onClick={() => removeMember(selectedGroup._id, mid)}
                          className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3">
                  <MemberPicker
                    members={members}
                    onPick={(id) => addMember(selectedGroup._id, id)}
                    disabled={!members.length}
                  />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Helpers & Small UI Bits ---------------- */

function renderMemberName(all: any[], id?: string) {
  if (!id) return "";
  const m = all.find((x) => x._id === id);
  return m ? `${m.firstName} ${m.lastName}` : "";
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      <input
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      <textarea
        rows={rows}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  icon,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="block text-sm mb-1">{label}</span>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        <select
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function MemberPicker({
  members,
  onPick,
  disabled,
}: {
  members: any[];
  onPick: (id: string) => void;
  disabled?: boolean;
}) {
  const [term, setTerm] = useState("");
  const results = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return members.slice(0, 12);
    return members.filter((m) =>
      [`${m.firstName} ${m.lastName}`, m.email, m.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t))
    );
  }, [members, term]);

  return (
    <div className="rounded-xl border p-3 bg-white/80 dark:bg-white/5">
      <div className="relative mb-2">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          disabled={disabled}
          placeholder="Find member by name, email or phone…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 disabled:opacity-60"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>

      <div className="max-h-56 overflow-auto space-y-1">
        {results.length === 0 && <div className="text-xs text-slate-500 p-2">No matches.</div>}
        {results.map((m: any) => (
          <button
            key={m._id}
            type="button"
            onClick={() => onPick(m._id)}
            className="w-full text-left px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-between"
          >
            <span className="text-sm">{m.firstName} {m.lastName}</span>
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
