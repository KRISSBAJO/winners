import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Church as ChurchIcon, Plus, Pencil, Trash2, Search, Eye, Mail, Phone, Building2, Map } from "lucide-react";
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
  const [openView, setOpenView] = useState(false);
  const [viewRow, setViewRow] = useState<Row | null>(null);

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

  const openDetails = (row: Row) => {
    setViewRow(row);
    setOpenView(true);
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking flex items-center gap-2">
            <ChurchIcon className="w-5 h-5 text-amber-600" /> Churches Management
          </h1>
          <p className="text-sm text-slate-500">Filter by National → District to manage churches.</p>
        </div>

        {canManage && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md"
            style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
          >
            <Plus className="w-4 h-4" /> New Church
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          className="px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={nationalId}
          onChange={(e) => onNationalChange(e.target.value)}
        >
          <option value="">Select national…</option>
          {nationals.map((n: any) => (
            <option key={n._id} value={n._id}>{n.name}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={!nationalId}
        >
          <option value="">{nationalId ? "Select district…" : "Select national first"}</option>
          {(districts || []).map((d: any) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
            placeholder="Search church…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Pastor</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">National</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={7}>Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={7}>No churches.</td></tr>
              )}
              {filtered.map((c: Row) => (
                <tr key={c._id} className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.churchId}</td>
                  <td className="px-4 py-3">{c.pastor}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-slate-50 text-slate-700">
                      <Map className="w-3 h-3" />
                      {getDistName(c.districtId)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-amber-50 text-amber-700">
                      <Building2 className="w-3 h-3" />
                      {getNatNameFromDistrict(c.districtId)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {c.contactEmail && <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.contactEmail}</span>}
                      {c.contactPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.contactPhone}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetails(c)}
                        className="px-2 py-1 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <>
                          <button onClick={() => startEdit(c)} className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(c._id)} className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
              <h3 className="text-lg font-semibold">{editingId ? "Edit Church" : "Create Church"}</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm">District</span>
                  <select
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
                    value={form.districtId}
                    onChange={(e) => setForm((p) => ({ ...p, districtId: e.target.value }))}
                  >
                    <option value="">Select district…</option>
                    {(districts || []).map((d: any) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </label>

                <TextField label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <TextField label="Code" value={form.churchId} onChange={(v) => setForm((p) => ({ ...p, churchId: v }))} />
                <TextField label="Pastor" value={form.pastor} onChange={(v) => setForm((p) => ({ ...p, pastor: v }))} />
                <TextField label="Email" value={form.contactEmail ?? ""} onChange={(v) => setForm((p) => ({ ...p, contactEmail: v }))} />
                <TextField label="Phone" value={form.contactPhone ?? ""} onChange={(v) => setForm((p) => ({ ...p, contactPhone: v }))} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <TextField label="City" value={form.address?.city ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), city: v } }))
                } />
                <TextField label="State" value={form.address?.state ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), state: v } }))
                } />
                <TextField label="Country" value={form.address?.country ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), country: v } }))
                } />
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

      {/* View Drawer */}
      <AnimatePresence>
        {openView && viewRow && (
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-white/10 p-6 overflow-y-auto"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChurchIcon className="w-5 h-5 text-amber-600" /> Church Details
              </h3>
              <button onClick={() => setOpenView(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>

            <DetailRow label="Name" value={viewRow.name} />
            <DetailRow label="Code" value={viewRow.churchId} />
            <DetailRow label="Pastor" value={viewRow.pastor} />
            {(viewRow.contactEmail || viewRow.contactPhone) && (
              <div className="text-sm flex gap-3 py-1">
                <span className="w-32 text-slate-500">Contact</span>
                <div className="flex-1 space-y-1">
                  {viewRow.contactEmail && <div className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> {viewRow.contactEmail}</div>}
                  {viewRow.contactPhone && <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4" /> {viewRow.contactPhone}</div>}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">District</h4>
              <div className="text-sm space-y-1">
                <div><span className="text-slate-500">Name:</span> {getDistName(viewRow.districtId)}</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">National Church</h4>
              <div className="text-sm space-y-1">
                <div><span className="text-slate-500">Name:</span> {getNatNameFromDistrict(viewRow.districtId)}</div>
              </div>
            </div>

            {viewRow.address && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Address</h4>
                <div className="text-sm space-y-1">
                  {viewRow.address.street && <div>{viewRow.address.street}</div>}
                  <div>
                    {[viewRow.address.city, viewRow.address.state, viewRow.address.zip].filter(Boolean).join(", ")}
                  </div>
                  {viewRow.address.country && <div>{viewRow.address.country}</div>}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      <input
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-sm flex gap-3 py-1">
      <span className="w-32 text-slate-500">{label}</span>
      <span className="flex-1">{value ?? "—"}</span>
    </div>
  );
}
