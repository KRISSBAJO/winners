// src/api/features/cells/components/ui/ConfirmDialog.tsx

import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md shadow-2xl border border-white/10"
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-lg border"> {cancelText} </button>
              <button
                onClick={async () => { await onConfirm(); onClose(); }}
                className="px-3 py-1.5 rounded-lg text-white"
                style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
