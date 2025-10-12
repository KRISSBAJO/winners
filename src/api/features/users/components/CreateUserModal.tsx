// src/api/features/users/components/CreateUserModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../../auth/hooks/useAuth";
import OrgCascader from "../../../../components/OrgCascader";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

type Props = { open: boolean; onClose: () => void };

export default function CreateUserModal({ open, onClose }: Props) {
  const { createUser, usersQuery } = useUsers();
  const { user } = useAuth();

  const canSeeAllRoles = user?.role === "siteAdmin";
  const roleOptions = useMemo(
    () =>
      canSeeAllRoles
        ? ["siteAdmin", "nationalPastor", "districtPastor", "churchAdmin", "pastor", "volunteer"]
        : ["churchAdmin", "pastor", "volunteer"],
    [canSeeAllRoles]
  );

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: roleOptions[roleOptions.length - 1], // default lowest
    nationalChurchId: "" as string | undefined,
    districtId: "" as string | undefined,
    churchId: "" as string | undefined,
  });

  // If church admin, lock scope to their church if available (optional best-effort)
  useEffect(() => {
    if (user?.role === "churchAdmin" && user.churchId) {
      setForm((f) => ({ ...f, churchId: String(user.churchId) }));
    }
  }, [user]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const scopeOk = useMemo(() => {
    if (form.role === "siteAdmin" || form.role === "nationalPastor" || form.role === "districtPastor") {
      // allow no church for higher roles (site admin sets national/district as needed)
      return true;
    }
    // for churchAdmin/pastor/volunteer ensure church scope if church admin
    if (user?.role === "churchAdmin") return !!form.churchId;
    return true;
  }, [form.role, form.churchId, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeOk) {
      alert("Please select the required scope for this role.");
      return;
    }
    setLoading(true);
    try {
      await createUser({
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password || undefined, // server may generate if omitted
        role: form.role as any,
        nationalChurchId: form.nationalChurchId || undefined,
        districtId: form.districtId || undefined,
        churchId: form.churchId || undefined,
      } as any);
      usersQuery.refetch();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/60 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Create New User</h2>
              <button onClick={onClose} className="opacity-70 hover:opacity-100">
                <XCircle className="text-slate-400 hover:text-red-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["firstName", "middleName", "lastName", "email"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium mb-1 capitalize">{field}</label>
                    <input
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      value={(form as any)[field]}
                      onChange={onChange}
                      required={["firstName", "lastName", "email"].includes(field)}
                      className="w-full px-3 py-2 border rounded-lg bg-white/80 dark:bg-slate-800/60 dark:border-slate-700 focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input
                    name="phone" value={form.phone} onChange={onChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white/80 dark:bg-slate-800/60 dark:border-slate-700 focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Password</label>
                  <input
                    name="password" type="password" value={form.password} onChange={onChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white/80 dark:bg-slate-800/60 dark:border-slate-700 focus:ring-2 focus:ring-amber-400/50"
                    placeholder="(optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  onChange={(sc) => {
                    setForm((f) => ({
                      ...f,
                      nationalChurchId: sc.nationalId || "",
                      districtId: sc.districtId || "",
                      churchId: sc.churchId || "",
                    }));
                  }}
                  className="bg-white/90 dark:bg-slate-900/70"
                />
                {!scopeOk && (
                  <p className="text-xs text-red-600">Church scope is required for this role.</p>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold shadow-md"
                style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
