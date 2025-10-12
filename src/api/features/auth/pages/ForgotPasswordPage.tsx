import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { authService } from "../services/authService";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await authService.requestPasswordReset(email);
      setMessage("Password reset link has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/10 via-[#D4AF37]/30 to-white animate-[gradientShift_8s_ease-in-out_infinite]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl rounded-2xl w-full max-w-md p-8 border border-white/40 dark:border-slate-700"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#D4AF37] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            DC
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-800 dark:text-white">
            Forgot Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your registered email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300/60 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
            }}
          >
            <Send size={18} />
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered your password?{" "}
          <a
            href="/login"
            className="font-medium text-[#8B0000] hover:text-[#D4AF37] transition-colors"
          >
            Back to Login
          </a>
        </p>
      </motion.div>

      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}
