// src/api/features/auth/pages/ChangePasswordPage.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function ChangePasswordPage() {
  const { user, changeMyPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // simple strength calc (0–4)
  const strength = useMemo(() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return Math.min(s, 4);
  }, [newPassword]);

  const strengthLabel = ["Very weak", "Weak", "Okay", "Good", "Strong"][strength];

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirm &&
    newPassword !== currentPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!canSubmit) {
      setError("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      await changeMyPassword({ currentPassword, newPassword });
      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl rounded-2xl shadow-3xl w-full max-w-lg p-8 border border-white/40 dark:border-slate-700"
      >
        {/* header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-[#8B0000] to-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Lock size={26} />
              
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Change Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user ? `Signed in as ${user.email}` : "You must be signed in."}
              </p>
            </div>
          </div>
          <a
            href="/dashboard/profile"
            className="text-xs px-3 py-1 rounded-lg border bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition"
            title="Back to profile"
          >
            Back
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* current password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className={`w-full px-4 py-3 rounded-lg border bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all
                ${currentPassword ? "border-slate-300/60 dark:border-slate-600" : "border-slate-300/60 dark:border-slate-600"}`}
                required
              />
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {/* new password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <span className="text-[11px] text-slate-500">
                min 8 chars • avoid last 10
              </span>
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className={`w-full px-4 py-3 rounded-lg border bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all
              ${newPassword && newPassword === currentPassword ? "border-red-400" : "border-slate-300/60 dark:border-slate-600"}`}
              required
            />

            {/* strength bar */}
            <div className="mt-2">
              <div className="h-2 w-full rounded bg-slate-200/60 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-2 rounded transition-all"
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                  }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{strengthLabel}</div>
            </div>
          </div>

          {/* confirm */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className={`w-full px-4 py-3 rounded-lg border bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all
              ${confirm && confirm !== newPassword ? "border-red-400" : "border-slate-300/60 dark:border-slate-600"}`}
              required
            />
            <AnimatePresence>
              {confirm && confirm !== newPassword && (
                <motion.p
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  className="mt-1 text-xs text-red-600"
                >
                  Passwords do not match.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* messages */}
          {message && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <ShieldCheck className="w-4 h-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* submit */}
          <motion.button
            type="submit"
            disabled={loading || !canSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
            }}
          >
            <Lock size={18} />
            {loading ? "Changing..." : "Change Password"}
          </motion.button>

          {/* tiny policy hint */}
          <p className="text-[11px] text-slate-500 mt-1">
            Tip: Use at least 8 characters with a mix of letters, numbers, and symbols. You
            can’t reuse any of your last 10 passwords.
          </p>
        </form>
      </motion.div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
