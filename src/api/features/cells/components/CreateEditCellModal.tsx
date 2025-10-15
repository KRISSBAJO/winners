import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import OrgCascader from "../../../../components/OrgCascader";
import MemberPicker from "../../followup/components/MemberPicker";
import { useCreateCell, useUpdateCell } from "../hooks/useCells";
import type { CellGroup } from "../types/cellTypes";

const BRAND = "linear-gradient(135deg,#8B0000,#D4AF37)";

type FormState = {
  nationalId?: string;
  districtId?: string;
  churchId: string;
  name: string;
  title?: string;
  description?: string;
  leaderId?: string;
  assistantId?: string;
  secretaryId?: string;
  isActive: boolean;
};

export default function CreateEditCellModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CellGroup;
}) {
  const create = useCreateCell();
  const update = useUpdateCell(initial?._id || "");

  const [form, setForm] = useState<FormState>({
    // new: keep national & district in state (even if undefined)
    nationalId: (initial as any)?.nationalId || undefined,
    districtId: (initial as any)?.districtId || undefined,
    churchId: initial?.churchId || "",
    name: initial?.name || "",
    title: initial?.title || "",
    description: initial?.description || "",
    leaderId: initial?.leaderId || "",
    assistantId: initial?.assistantId || "",
    secretaryId: initial?.secretaryId || "",
    isActive: initial?.isActive ?? true,
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      nationalId: (initial as any)?.nationalId || undefined,
      districtId: (initial as any)?.districtId || undefined,
      churchId: initial.churchId || "",
      name: initial.name || "",
      title: initial.title || "",
      description: initial.description || "",
      leaderId: initial.leaderId || "",
      assistantId: initial.assistantId || "",
      secretaryId: initial.secretaryId || "",
      isActive: initial.isActive ?? true,
    });
  }, [initial]);

  const isEdit = Boolean(initial);

  // ✅ Capture all three IDs from OrgCascader
  const onScopeChange = useCallback(
    (sc: { nationalId?: string; districtId?: string; churchId?: string }) => {
      setForm((f) => ({
        ...f,
        nationalId: sc.nationalId || undefined,
        districtId: sc.districtId || undefined,
        churchId: sc.churchId || "",
      }));
    },
    []
  );

  const submit = async () => {
    // Build payload with all IDs; strip empty strings to avoid noise
    const payload = {
      nationalId: form.nationalId || undefined,
      districtId: form.districtId || undefined,
      churchId: form.churchId,
      name: form.name,
      title: form.title || undefined,
      description: form.description || undefined,
      leaderId: form.leaderId || undefined,
      assistantId: form.assistantId || undefined,
      secretaryId: form.secretaryId || undefined,
      isActive: form.isActive,
    };

    if (isEdit) {
      await update.mutateAsync(payload as any);
    } else {
      await create.mutateAsync(payload as any);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl shadow-2xl border border-white/10"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {isEdit ? "Edit Cell" : "Create Cell"}
              </h3>
              <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Pass/receive ALL IDs */}
              <OrgCascader
                value={{
                  nationalId: form.nationalId,
                  districtId: form.districtId,
                  churchId: form.churchId || undefined,
                }}
                onChange={onScopeChange}
                compact
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Title (optional)</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Leader</label>
                  <MemberPicker
                    churchId={form.churchId}
                    value={form.leaderId}
                    onChange={(id) =>
                      setForm((f) => ({ ...f, leaderId: id || "" }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Assistant</label>
                  <MemberPicker
                    churchId={form.churchId}
                    value={form.assistantId}
                    onChange={(id) =>
                      setForm((f) => ({ ...f, assistantId: id || "" }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Secretary</label>
                  <MemberPicker
                    churchId={form.churchId}
                    value={form.secretaryId}
                    onChange={(id) =>
                      setForm((f) => ({ ...f, secretaryId: id || "" }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="cell-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                <label htmlFor="cell-active" className="text-sm">
                  Active
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={
                    !form.churchId ||
                    !form.name ||
                    (isEdit ? update.isPending : create.isPending)
                  }
                  onClick={submit}
                  className="text-white px-4 py-2 rounded-lg shadow disabled:opacity-60"
                  style={{ background: BRAND }}
                >
                  {isEdit ? "Save Changes" : "Create Cell"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
