// src/api/features/users/components/EditUserModal.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Save } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../auth/hooks/useAuth";
import OrgCascader from "../../../../components/OrgCascader";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

type Props = {
  open: boolean;
  userId: string;
  onClose: () => void;
};

export default function EditUserModal({ open, userId, onClose }: Props) {
  const { usersQuery, updateUserAdmin } = useUsers();
  const { user: actor } = useAuth();

  const target = useMemo(
    () => (usersQuery.data ?? []).find((u) => u._id === userId),
    [usersQuery.data, userId]
  );

  const canSeeAllRoles = actor?.role === "siteAdmin";
  const roleOptions = useMemo(
    () =>
      canSeeAllRoles
        ? ["siteAdmin", "nationalPastor", "districtPastor", "churchAdmin", "pastor", "volunteer"]
        : ["churchAdmin", "pastor", "volunteer"],
    [canSeeAllRoles]
  );

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    role: "volunteer",
    isActive: true,
    nationalChurchId: "" as string | undefined,
    districtId: "" as string | undefined,
    churchId: "" as string | undefined,
  });

  useEffect(() => {
    if (target) {
      setForm({
        firstName: target.firstName || "",
        middleName: target.middleName || "",
        lastName: target.lastName || "",
        phone: target.phone || "",
        role: (roleOptions.includes(target.role) ? target.role : "volunteer") as any,
        isActive: !!target.isActive,
        nationalChurchId: (target as any).nationalChurchId ? String((target as any).nationalChurchId) : "",
        districtId: (target as any).districtId ? String((target as any).districtId) : "",
        churchId: (target as any).churchId ? String((target as any).churchId) : "",
      });
    }
  }, [target, roleOptions]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onToggleActive = () =>
    setForm((p) => ({ ...p, isActive: !p.isActive }));

  const scopeOk = useMemo(() => {
    if (form.role === "siteAdmin" || form.role === "nationalPastor" || form.role === "districtPastor") {
      return true;
    }
    if (actor?.role === "churchAdmin") return !!form.churchId;
    return true;
  }, [form.role, form.churchId, actor?.role]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (!scopeOk) {
      alert("Please select the required scope for this role.");
      return;
    }
    setSaving(true);
    try {
      await updateUserAdmin({
        id: target._id,
        data: {
          firstName: form.firstName,
          middleName: form.middleName || undefined,
          lastName: form.lastName,
          phone: form.phone || undefined,
          role: form.role as any,
          isActive: form.isActive,
          nationalChurchId: form.nationalChurchId || undefined,
          districtId: form.districtId || undefined,
          churchId: form.churchId || undefined,
        },
      });
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && target && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200/60 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit User</h2>
              <button onClick={onClose} className="opacity-70 hover:opacity-100">
                <XCircle className="text-slate-400 hover:text-red-500" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["firstName", "middleName", "lastName", "phone"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium mb-1 capitalize">{field}</label>
                    <input
                      name={field}
                      value={(form as any)[field]}
                      onChange={onChange}
                      className="w-full px-3 py-2 border rounded-lg bg-white/80 dark:bg-slate-800/60 dark:border-slate-700 focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1">Role</label>
                  <select
                    name="role" value={form.role} onChange={onChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white/80 dark:bg-slate-800/60 dark:border-slate-700 focus:ring-2 focus:ring-amber-400/50"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Active</label>
                  <button
                    type="button"
                    onClick={onToggleActive}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      form.isActive
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Organizational Scope (National → District → Church)
                </label>
                <OrgCascader
                  compact
                  value={{
                    nationalId: form.nationalChurchId || undefined,
                    districtId: form.districtId || undefined,
                    churchId: form.churchId || undefined,
                  }}
                  onChange={(sc) =>
                    setForm((f) => ({
                      ...f,
                      nationalChurchId: sc.nationalId || "",
                      districtId: sc.districtId || "",
                      churchId: sc.churchId || "",
                    }))
                  }
                />
                {!scopeOk && (
                  <p className="text-xs text-red-600">Church scope is required for this role.</p>
                )}
              </div>

              <button
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-semibold shadow-md"
                style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
