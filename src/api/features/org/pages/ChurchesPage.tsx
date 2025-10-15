import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Church as ChurchIcon, Plus, Pencil, Trash2, Search, Eye, Mail, Phone, Building2, Map, X } from "lucide-react";
import {
  useNationalList,
  useDistrictsByNational,
  useChurchesByDistrict,
  useCreateChurch,
  useUpdateChurch,
  useDeleteChurch,
} from "../../org/hooks/useOrg";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import { toast } from "sonner";

type Address = { street?: string; city?: string; state?: string; country?: string; zip?: string };

type DistrictLite =
  | string
  | {
      _id: string;
      name: string;
      code?: string;
      districtPastor?: string;
      nationalChurchId?: string | { _id: string; name: string };
      address?: Address;
    };

type Row = {
  _id: string;
  districtId: DistrictLite;
  name: string;
  churchId: string;
  pastor: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
};

type FormValues = {
  districtId: string; // always a STRING id in the form
  name: string;
  churchId: string;
  pastor: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Address;
};

export default function ChurchesPage() {
  const { user, scope } = useAuthStore();
  const canManage = ["siteAdmin", "districtPastor"].includes(user?.role ?? "");

  // Filters
  const { data: nationals = [] } = useNationalList();
  const [nationalId, setNationalId] = useState(scope.nationalChurchId || "");
  const { data: districts = [] } = useDistrictsByNational(nationalId || undefined);
  const [districtId, setDistrictId] = useState(scope.districtId || "");
  const { data: churches = [], isLoading } = useChurchesByDistrict(districtId || undefined);

  // CRUD
  const createMutation = useCreateChurch();
  const updateMutation = useUpdateChurch();
  const deleteMutation = useDeleteChurch();

  // Local state
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    districtId: districtId || "",
    name: "",
    churchId: "",
    pastor: "",
    contactEmail: "",
    contactPhone: "",
    address: { street: "", city: "", state: "", country: "", zip: "" },
  });

  // View drawer
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // ---------- helpers for mixed type districtId ----------
  const getDistId = (d: DistrictLite | undefined) =>
    !d ? "" : typeof d === "string" ? d : d._id;

  const getDistName = (d: DistrictLite | undefined) =>
    !d ? "—" : typeof d === "string"
      ? (districts as any[]).find((x) => x._id === d)?.name ?? "—"
      : d.name ?? "—";

  const getNatNameFromDistrict = (d: DistrictLite | undefined) => {
    if (!d) return "—";
    if (typeof d === "string") {
      // When church.districtId is just id, we can still infer national via selected filter or districts cache
      const dist = (districts as any[]).find((x) => x._id === d);
      if (!dist) return "—";
      const natId = typeof dist.nationalChurchId === "string" ? dist.nationalChurchId : dist.nationalChurchId?._id;
      return nationals.find((n: any) => n._id === natId)?.name ?? "—";
    }
    // populated district
    const nat = d.nationalChurchId;
    if (!nat) return "—";
    return typeof nat === "string"
      ? nationals.find((n: any) => n._id === nat)?.name ?? "—"
      : nat.name ?? "—";
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return (churches as Row[]) || [];
    return (churches as Row[]).filter((c) =>
      [c.name, c.churchId, c.pastor, c.contactEmail, c.contactPhone, getDistName(c.districtId)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [churches, query, districts]);

  const selectedChurch = useMemo(() => churches.find((c: any) => c._id === drawerId), [churches, drawerId]);

  // reset child when parent changes
  const onNationalChange = (id: string) => {
    setNationalId(id);
    setDistrictId("");
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      districtId: districtId || "",
      name: "",
      churchId: "",
      pastor: "",
      contactEmail: "",
      contactPhone: "",
      address: { street: "", city: "", state: "", country: "", zip: "" },
    });
    setOpenForm(true);
  };

  const startEdit = (row: Row) => {
    setEditingId(row._id);
    setForm({
      districtId: getDistId(row.districtId),
      name: row.name,
      churchId: row.churchId,
      pastor: row.pastor,
      contactEmail: row.contactEmail ?? "",
      contactPhone: row.contactPhone ?? "",
      address: {
        street: row.address?.street ?? "",
        city: row.address?.city ?? "",
        state: row.address?.state ?? "",
        country: row.address?.country ?? "",
        zip: row.address?.zip ?? "",
      },
    });
    setOpenForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.districtId) {
      toast.error("Please choose a District.");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: form });
        toast.success("Church updated.");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Church created.");
      }
      setOpenForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Operation failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this church?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Church deleted");
      if (drawerId === id) setDrawerId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Delete failed");
    }
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ChurchIcon className="w-5 h-5 text-amber-600" /> Churches Management
          </h1>
          <p className="text-sm text-slate-500">Filter by National → District to manage churches.</p>
        </div>

        {canManage && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md disabled:opacity-60"
            disabled={!districtId}
            style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
          >
            <Plus className="w-4 h-4" /> New Church
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
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
          onChange={setDistrictId}
          disabled={!nationalId}
          options={[
            { label: nationalId ? "Select district…" : "Select national first", value: "" },
            ...districts.map((d: any) => ({ label: d.name, value: d._id })),
          ]}
        />
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
            placeholder="Search churches…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 sticky top-0 z-10 shadow-sm">
              <tr className="divide-x divide-slate-200 dark:divide-slate-700">
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Code</th>
                <th className="px-6 py-4 text-left font-semibold">Pastor</th>
                <th className="px-6 py-4 text-left font-semibold">District</th>
                <th className="px-6 py-4 text-left font-semibold">National</th>
                <th className="px-6 py-4 text-left font-semibold">Contact</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading && (
                <tr><td colSpan={7} className="px-6 py-6 text-center text-slate-500">Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-6 text-center text-slate-500">No churches.</td></tr>
              )}
              {filtered.map((c: Row, i) => (
                <motion.tr 
                  key={c._id} 
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 divide-x divide-slate-100 dark:divide-white/5 ${
                    i % 2 === 0 ? 'bg-white/70 dark:bg-slate-900/30' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    <button className="font-medium hover:underline" onClick={() => setDrawerId(c._id)}>
                      {c.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{c.churchId}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{c.pastor}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-slate-50 text-slate-700">
                      <Map className="w-3 h-3" />
                      {getDistName(c.districtId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-amber-50 text-amber-700">
                      <Building2 className="w-3 h-3" />
                      {getNatNameFromDistrict(c.districtId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col">
                      {c.contactEmail && <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.contactEmail}</span>}
                      {c.contactPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.contactPhone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && (
                        <>
                          <button onClick={() => startEdit(c)} className="p-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(c._id)} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {openForm && (
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
                <h3 className="text-lg font-semibold">{editingId ? "Edit Church" : "Create Church"}</h3>
                <button type="button" onClick={() => setOpenForm(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <Select
                  label="District"
                  value={form.districtId}
                  onChange={(v) => setForm((p) => ({ ...p, districtId: v }))}
                  options={[
                    { label: "Select district…", value: "" },
                    ...districts.map((d: any) => ({ label: d.name, value: d._id })),
                  ]}
                />
                <Text label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <Text label="Code" value={form.churchId} onChange={(v) => setForm((p) => ({ ...p, churchId: v }))} />
                <Text label="Pastor" value={form.pastor} onChange={(v) => setForm((p) => ({ ...p, pastor: v }))} />
                <Text label="Email" value={form.contactEmail ?? ""} onChange={(v) => setForm((p) => ({ ...p, contactEmail: v }))} />
                <Text label="Phone" value={form.contactPhone ?? ""} onChange={(v) => setForm((p) => ({ ...p, contactPhone: v }))} />
                <Text label="Street" value={form.address?.street ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), street: v } }))
                } />
                <div className="grid sm:grid-cols-4 gap-4">
                  <Text label="City" value={form.address?.city ?? ""} onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...(p.address ?? {}), city: v } }))
                  } />
                  <Text label="State" value={form.address?.state ?? ""} onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...(p.address ?? {}), state: v } }))
                  } />
                  <Text label="Zip" value={form.address?.zip ?? ""} onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...(p.address ?? {}), zip: v } }))
                  } />
                  <Text label="Country" value={form.address?.country ?? ""} onChange={(v) =>
                    setForm((p) => ({ ...p, address: { ...(p.address ?? {}), country: v } }))
                  } />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerId && selectedChurch && (
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
                  <ChurchIcon className="w-4 h-4" /> Church
                </div>
                <h3 className="text-xl font-semibold">{selectedChurch.name}</h3>
              </div>
              <button onClick={() => setDrawerId(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-6">
              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Basic Information</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Code</span>
                    <span>{selectedChurch.churchId || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pastor</span>
                    <span>{selectedChurch.pastor || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Contact</div>
                {(selectedChurch.contactEmail || selectedChurch.contactPhone) ? (
                  <div className="space-y-2 text-sm">
                    {selectedChurch.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        {selectedChurch.contactEmail}
                      </div>
                    )}
                    {selectedChurch.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        {selectedChurch.contactPhone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No contact information.</div>
                )}
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">District</div>
                <div className="text-sm">{getDistName(selectedChurch.districtId) || "—"}</div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">National Church</div>
                <div className="text-sm">{getNatNameFromDistrict(selectedChurch.districtId) || "—"}</div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Address</div>
                {!selectedChurch.address || Object.values(selectedChurch.address).every(v => !v) ? (
                  <div className="text-sm text-slate-500">No address provided.</div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {selectedChurch.address.street && <div>{selectedChurch.address.street}</div>}
                    <div>
                      {[selectedChurch.address.city, selectedChurch.address.state, selectedChurch.address.zip].filter(Boolean).join(", ")}
                    </div>
                    {selectedChurch.address.country && <div>{selectedChurch.address.country}</div>}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Helpers & Small UI Bits ---------------- */

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