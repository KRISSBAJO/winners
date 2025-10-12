import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Pencil, Trash2, Search, Mail, Phone, MapPin, Eye,
} from "lucide-react";
import {
  useNationalList,
  useCreateNational,
  useUpdateNational,
  useDeleteNational,
} from "../../org/hooks/useOrg";
import { useAuthStore } from "../../../../api/features/auth/store/useAuthStore";
import { toast } from "sonner";
import NationalOverviewCard from "../components/NationalOverviewCard";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNationalId, setDrawerNationalId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query) return nationals;
    const q = query.toLowerCase();
    return nationals.filter((n: any) =>
      [n.name, n.code, n.nationalPastor, n.contactEmail, n.contactPhone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [nationals, query]);

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      nationalPastor: "",
      contactEmail: "",
      contactPhone: "",
      address: EmptyAddress(),
    });
    setEditingId(null);
  };

  const startCreate = () => {
    resetForm();
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

  const openOverview = (id: string) => {
    setDrawerNationalId(id);
    setDrawerOpen(true);
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
      resetForm();
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
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search national…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white/90 dark:bg-slate-800/70"
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
                <th className="px-4 py-3 text-left">National Pastor</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    No national churches found.
                  </td>
                </tr>
              )}
              {filtered.map((n: any) => (
                <tr
                  key={n._id}
                  className="border-t border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">{n.name}</td>
                  <td className="px-4 py-3">{n.code}</td>
                  <td className="px-4 py-3">{n.nationalPastor}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openOverview(n._id)}
                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/90"
                        title="View overview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => startEdit(n)}
                            className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(n._id)}
                            className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete"
                          >
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
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit National Church" : "Create National Church"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
                <TextField label="Code" value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v }))} />
                <TextField
                  label="National Pastor"
                  value={form.nationalPastor}
                  onChange={(v) => setForm((p) => ({ ...p, nationalPastor: v }))}
                />
                <TextField
                  label="Email"
                  value={form.contactEmail ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, contactEmail: v }))}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                />
                <TextField
                  label="Phone"
                  value={form.contactPhone ?? ""}
                  onChange={(v) => setForm((p) => ({ ...p, contactPhone: v }))}
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <TextField label="Street" value={form.address?.street ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), street: v } }))
                } icon={<MapPin className="w-4 h-4 text-slate-400" />} />
                <TextField label="City" value={form.address?.city ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), city: v } }))
                } />
                <TextField label="State" value={form.address?.state ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), state: v } }))
                } />
                <TextField label="Country" value={form.address?.country ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), country: v } }))
                } />
                <TextField label="ZIP" value={form.address?.zip ?? ""} onChange={(v) =>
                  setForm((p) => ({ ...p, address: { ...(p.address ?? {}), zip: v } }))
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

      {/* Right Drawer: National Overview */}
      <AnimatePresence>
        {drawerOpen && drawerNationalId && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer Panel */}
            <motion.aside
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/70 dark:border-white/10 p-5 overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 110, damping: 18 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">National Overview</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md px-3 py-1 border border-slate-200 dark:border-white/10 hover:bg-slate-50/60 dark:hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <NationalOverviewCard nationalId={drawerNationalId} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5">{icon}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:ring-2 focus:ring-amber-500/40`}
        />
      </div>
    </label>
  );
}
