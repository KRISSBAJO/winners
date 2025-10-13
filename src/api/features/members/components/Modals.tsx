// src/features/members/components/Modals.tsx
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Member, MembershipStatus } from "../types/memberTypes";

export function MemberModal({
  open, onClose, editing, selectedScope, onSubmit, saving,
}: {
  open: boolean;
  onClose: () => void;
  editing: Member | null;
  selectedScope: { churchId?: string };
  onSubmit: (payload: Partial<Member>) => Promise<any> | void;
  saving?: boolean;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<Partial<Member>>({
    firstName: "", lastName: "", middleName: "", email: "", phone: "",
    membershipStatus: "Active" as MembershipStatus,
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form
            onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 border"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{isEdit ? "Edit Member" : "New Member"}</h3>
              <button type="button" onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First Name" value={form.firstName ?? ""} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Field label="Last Name"  value={form.lastName ?? ""}  onChange={(v) => setForm({ ...form, lastName: v })} />
              <Field label="Middle Name" value={form.middleName ?? ""} onChange={(v) => setForm({ ...form, middleName: v })} />
              <Field label="Email" type="email" value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
              <label className="block">
                <span className="block text-sm font-medium mb-1">Status</span>
                <select
                  className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
                  value={form.membershipStatus ?? "Active"}
                  onChange={(e) => setForm({ ...form, membershipStatus: e.target.value as MembershipStatus })}
                >
                  <option>Active</option>
                  <option>Visitor</option>
                  <option>New Convert</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button
                type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70"
                style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
              >
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
      />
    </label>
  );
}
