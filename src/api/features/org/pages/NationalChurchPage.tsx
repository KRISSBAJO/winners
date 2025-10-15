import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Pencil, Trash2, Search, Mail, Phone, MapPin, X,
} from "lucide-react";
import {
  useNationalList,
  useCreateNational,
  useUpdateNational,
  useDeleteNational,
} from "../../org/hooks/useOrg";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import { toast } from "sonner";

type FormValues = {
  name: string;
  code: string;
  nationalPastor: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
};

function EmptyAddress(): NonNullable<FormValues["address"]> {
  return { street: "", city: "", state: "", country: "", zip: "" };
}

export default function NationalChurchPage() {
  const { user } = useAuthStore();
  const canManage = ["siteAdmin"].includes(user?.role ?? "");

  const { data: nationals = [], isLoading } = useNationalList();
  const createMutation = useCreateNational();
  const updateMutation = useUpdateNational();
  const deleteMutation = useDeleteNational();

  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    name: "",
    code: "",
    nationalPastor: "",
    contactEmail: "",
    contactPhone: "",
    address: EmptyAddress(),
  });

  // Drawer state
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query) return nationals;
    const q = query.toLowerCase();
    return nationals.filter((n: any) =>
      [n.name, n.code, n.nationalPastor, n.contactEmail, n.contactPhone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [nationals, query]);

  const selectedNational = useMemo(() => nationals.find((n: any) => n._id === drawerId), [nationals, drawerId]);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      code: "",
      nationalPastor: "",
      contactEmail: "",
      contactPhone: "",
      address: EmptyAddress(),
    });
    setOpenForm(true);
  };

  const startEdit = (row: any) => {
    setEditingId(row._id);
    setForm({
      name: row.name,
      code: row.code,
      nationalPastor: row.nationalPastor,
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
    if (!form.name?.trim() || !form.code?.trim() || !form.nationalPastor?.trim()) {
      toast.error("Please fill Name, Code and National Pastor.");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: form });
        toast.success("National church updated ✅");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("National church created 🎉");
      }
      setOpenForm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Operation failed";
      toast.error(msg);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this national church?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("National church deleted");
      if (drawerId === id) setDrawerId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
    }
  };

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" /> National Churches Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage national-level metadata, leadership and contacts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white shadow-md"
            style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
          >
            <Plus className="w-4 h-4" /> New National
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          placeholder="Search nationals…"
          className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 sticky top-0 z-10 shadow-sm">
              <tr className="divide-x divide-slate-200 dark:divide-slate-700">
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Code</th>
                <th className="px-6 py-4 text-left font-semibold">National Pastor</th>
                <th className="px-6 py-4 text-left font-semibold">Contact</th>
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
                    No national churches.
                  </td>
                </tr>
              )}
              {filtered.map((n: any, i) => (
                <motion.tr 
                  key={n._id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 divide-x divide-slate-100 dark:divide-white/5 ${
                    i % 2 === 0 ? 'bg-white/70 dark:bg-slate-900/30' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    <button className="font-medium hover:underline" onClick={() => setDrawerId(n._id)}>
                      {n.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{n.code}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{n.nationalPastor}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col gap-0.5">
                      {n.contactEmail && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {n.contactEmail}
                        </span>
                      )}
                      {n.contactPhone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {n.contactPhone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && (
                        <>
                          <button onClick={() => startEdit(n)} className="p-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => remove(n._id)} className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" title="Delete">
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
                <h3 className="text-lg font-semibold">
                  {editingId ? "Edit National Church" : "Create National Church"}
                </h3>
                <button type="button" onClick={() => setOpenForm(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-4">
                <Text label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <Text label="Code" value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v }))} />
                <Text
                  label="National Pastor"
                  value={form.nationalPastor}
                  onChange={(v) => setForm((p) => ({ ...p, nationalPastor: v }))}
                />
                <Text
                  label="Email"
                  value={form.contactEmail ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, contactEmail: v }))}
                />
                <Text
                  label="Phone"
                  value={form.contactPhone ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, contactPhone: v }))}
                />
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
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
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
        {drawerId && selectedNational && (
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
                  <Building2 className="w-4 h-4" /> National Church
                </div>
                <h3 className="text-xl font-semibold">{selectedNational.name}</h3>
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
                    <span>{selectedNational.code || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Pastor</span>
                    <span>{selectedNational.nationalPastor || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Contact</div>
                {(selectedNational.contactEmail || selectedNational.contactPhone) ? (
                  <div className="space-y-2 text-sm">
                    {selectedNational.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        {selectedNational.contactEmail}
                      </div>
                    )}
                    {selectedNational.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        {selectedNational.contactPhone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No contact information.</div>
                )}
              </div>

              <div className="rounded-xl border p-4 bg-white/80 dark:bg-white/5">
                <div className="text-sm text-slate-500 mb-2">Address</div>
                {!selectedNational.address || Object.values(selectedNational.address).every(v => !v) ? (
                  <div className="text-sm text-slate-500">No address provided.</div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {selectedNational.address.street && <div>{selectedNational.address.street}</div>}
                    <div>
                      {[selectedNational.address.city, selectedNational.address.state, selectedNational.address.zip].filter(Boolean).join(", ")}
                    </div>
                    {selectedNational.address.country && <div>{selectedNational.address.country}</div>}
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