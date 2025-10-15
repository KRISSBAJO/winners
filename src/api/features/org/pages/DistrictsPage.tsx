import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Mail,
  Phone,
  Building2,
  X,
} from "lucide-react";
import {
  useNationalList,
  useDistrictsByNational,
  useCreateDistrict,
  useUpdateDistrict,
  useDeleteDistrict,
} from "../../org/hooks/useOrg";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import { toast } from "sonner";

/* -------------------- Types -------------------- */

type Address = { street?: string; city?: string; state?: string; country?: string; zip?: string };

type NationalLite =
  | string
  | {
      _id: string;
      name: string;
      code?: string;
      nationalPastor?: string;
      contactEmail?: string;
      contactPhone?: string;
      address?: Address;
    };

type Row = {
  _id: string;
  nationalChurchId: NationalLite;
  name: string;
  code: string;
  districtPastor: string;
  address?: Address;
};

type FormValues = {
  nationalChurchId: string; // always a STRING id in the form
  name: string;
  code: string;
  districtPastor: string;
  address?: Address;
};

/* -------------------- Utils -------------------- */

const BRAND_GRADIENT = "linear-gradient(135deg,#8B0000,#D4AF37)";

const emptyAddr = (): Address => ({ street: "", city: "", state: "", country: "", zip: "" });

/* =========================================================
   DistrictsPage — redesigned to match ChurchesPage styling
   ========================================================= */

export default function DistrictsPage() {
  const { user, scope } = useAuthStore();
  const canManage = ["siteAdmin", "nationalPastor"].includes(user?.role ?? "");

  // Data
  const { data: nationals = [] } = useNationalList();
  const [nationalId, setNationalId] = useState(scope.nationalChurchId || "");
  const { data: districts = [], isLoading } = useDistrictsByNational(nationalId || undefined);

  // CRUD
  const createMutation = useCreateDistrict();
  const updateMutation = useUpdateDistrict();
  const deleteMutation = useDeleteDistrict();

  // Local state
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    nationalChurchId: nationalId || "",
    name: "",
    code: "",
    districtPastor: "",
    address: emptyAddr(),
  });

  // Drawer
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // Helpers for mixed type national
  const getNatId = (nat: NationalLite | undefined) => (!nat ? "" : typeof nat === "string" ? nat : nat._id);
  const getNatName = (nat: NationalLite | undefined) =>
    !nat
      ? "—"
      : typeof nat === "string"
      ? nationals.find((n: any) => n._id === nat)?.name ?? "—"
      : nat.name ?? "—";

  // Filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return (districts as Row[]) || [];
    return (districts as Row[]).filter((d) =>
      [d.name, d.code, d.districtPastor, getNatName(d.nationalChurchId)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [districts, query, nationals]);

  const selectedRow: Row | undefined = useMemo(
    () => (districts as Row[]).find((d) => d._id === drawerId),
    [districts, drawerId]
  );

  // Actions
  const startCreate = () => {
    setEditingId(null);
    setForm({
      nationalChurchId: nationalId || "",
      name: "",
      code: "",
      districtPastor: "",
      address: emptyAddr(),
    });
    setOpenForm(true);
  };

  const startEdit = (row: Row) => {
    setEditingId(row._id);
    setForm({
      nationalChurchId: getNatId(row.nationalChurchId),
      name: row.name,
      code: row.code,
      districtPastor: row.districtPastor,
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
    if (!form.nationalChurchId) {
      toast.error("Please choose a National Church.");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: form });
        toast.success("District updated.");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("District created.");
      }
      setOpenForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Operation failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this district?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("District deleted");
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
            <Map className="w-5 h-5 text-amber-600" />
            Districts Management
          </h1>
          <p className="text-sm text-slate-500">Filter by National to manage districts.</p>
        </div>

        {canManage && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md disabled:opacity-60"
            disabled={!nationalId}
            style={{ background: BRAND_GRADIENT }}
          >
            <Plus className="w-4 h-4" /> New District
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Select
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
          value={nationalId}
          onChange={setNationalId}
          options={[
            { label: "Select national…", value: "" },
            ...nationals.map((n: any) => ({ label: n.name, value: n._id })),
          ]}
        />
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
            placeholder="Search districts…"
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
                <th className="px-6 py-4 text-left font-semibold">District Pastor</th>
                <th className="px-6 py-4 text-left font-semibold">National</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No districts.
                  </td>
                </tr>
              )}

              {filtered.map((d: Row, i) => (
                <motion.tr
                  key={d._id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 divide-x divide-slate-100 dark:divide-white/5 ${
                    i % 2 === 0 ? "bg-white/70 dark:bg-slate-900/30" : ""
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    <button className="hover:underline" onClick={() => setDrawerId(d._id)}>
                      {d.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{d.code}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{d.districtPastor}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-amber-50 text-amber-700">
                      <Building2 className="w-3 h-3" />
                      {getNatName(d.nationalChurchId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setDrawerId(d._id)}
                        className="p-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => startEdit(d)}
                            className="p-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(d._id)}
                            className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete"
                          >
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={submit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">
                  {editingId ? "Edit District" : "Create District"}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <Select
                  label="National Church"
                  value={form.nationalChurchId}
                  onChange={(v) => setForm((p) => ({ ...p, nationalChurchId: v }))}
                  options={[
                    { label: "Select national…", value: "" },
                    ...nationals.map((n: any) => ({ label: n.name, value: n._id })),
                  ]}
                />
                <Text label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <Text label="Code" value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v }))} />
                <Text
                  label="District Pastor"
                  value={form.districtPastor}
                  onChange={(v) => setForm((p) => ({ ...p, districtPastor: v }))}
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Text
                    label="City"
                    value={form.address?.city ?? ""}
                    onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address ?? {}), city: v } }))}
                  />
                  <Text
                    label="State"
                    value={form.address?.state ?? ""}
                    onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address ?? {}), state: v } }))}
                  />
                  <Text
                    label="Country"
                    value={form.address?.country ?? ""}
                    onChange={(v) => setForm((p) => ({ ...p, address: { ...(p.address ?? {}), country: v } }))}
                  />
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
                  style={{ background: BRAND_GRADIENT }}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Drawer */}
      <AnimatePresence>
        {drawerId && selectedRow && (
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
                  <Map className="w-4 h-4" /> District
                </div>
                <h3 className="text-xl font-semibold">{selectedRow.name}</h3>
              </div>
              <button onClick={() => setDrawerId(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-6">
              <Card title="Basic Information">
                <KV label="Code" value={selectedRow.code} />
                <KV label="District Pastor" value={selectedRow.districtPastor} />
              </Card>

              <Card title="National Church">
                <div className="space-y-2 text-sm">
                  <KV label="Name" value={getNatName(selectedRow.nationalChurchId)} />
                  {typeof selectedRow.nationalChurchId !== "string" && (
                    <>
                      {selectedRow.nationalChurchId.code && (
                        <KV label="Code" value={selectedRow.nationalChurchId.code} />
                      )}
                      {selectedRow.nationalChurchId.nationalPastor && (
                        <KV label="Pastor" value={selectedRow.nationalChurchId.nationalPastor} />
                      )}
                      {(selectedRow.nationalChurchId.contactEmail ||
                        selectedRow.nationalChurchId.contactPhone) && (
                        <div className="space-y-1 text-sm">
                          {selectedRow.nationalChurchId.contactEmail && (
                            <div className="inline-flex items-center gap-2">
                              <Mail className="w-4 h-4" /> {selectedRow.nationalChurchId.contactEmail}
                            </div>
                          )}
                          {selectedRow.nationalChurchId.contactPhone && (
                            <div className="inline-flex items-center gap-2">
                              <Phone className="w-4 h-4" /> {selectedRow.nationalChurchId.contactPhone}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              <Card title="Address">
                {!selectedRow.address || Object.values(selectedRow.address).every((v) => !v) ? (
                  <div className="text-sm text-slate-500">No address provided.</div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {selectedRow.address.street && <div>{selectedRow.address.street}</div>}
                    <div>
                      {[selectedRow.address.city, selectedRow.address.state, selectedRow.address.zip]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {selectedRow.address.country && <div>{selectedRow.address.country}</div>}
                  </div>
                )}
              </Card>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Small UI Bits (match Churches) ---------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
      <div className="text-sm text-slate-500 mb-2">{title}</div>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
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
