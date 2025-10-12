import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { LogIn, UserPlus, KeyRound } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function LoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo =
        (location.state as { from?: Location })?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6d0d0] via-[#D4AF37]/30 to-[#fff]/20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-[gradientShift_8s_ease-in-out_infinite]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl rounded-2xl w-full max-w-md p-8 border border-white/40 dark:border-slate-700"
      >
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <Link to="/" className="mx-auto w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#D4AF37] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            DC
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to your Dominion Connect account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300/60 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-slate-300/60 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/60 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center"
            >
              {error.message || "Login failed. Please try again."}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 mt-2 rounded-lg text-white font-semibold shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
            }}
          >
            <LogIn size={18} />
            {isLoading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        {/* Links below form */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/reset-password-request"
            className="inline-flex items-center justify-center gap-1 text-sm font-medium text-[#8B0000] hover:text-[#D4AF37] transition-colors"
          >
            <KeyRound size={15} />
            Forgot password?
          </Link>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#8B0000] hover:text-[#D4AF37] transition"
            >
              <UserPlus className="inline w-4 h-4 mr-1" />
              Create one
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Animation Keyframes */}
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
