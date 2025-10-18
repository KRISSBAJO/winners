import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Youtube, Mail, MapPin, CheckCircle, AlertCircle } from "lucide-react";

const BRAND_GOLD = "#D4AF37";
const BRAND_RED = "#8B0000";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // TODO: validate & call API
    setTimeout(() => {
      setSuccess(true);
      setEmail("");
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3500);
    }, 800);
  };

  return (
    <footer className="relative bg-[#021347] text-white overflow-hidden">
      {/* Thin gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: BRAND_GOLD }} aria-hidden />

      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 lg:py-10 relative z-10">
        {/* Compact newsletter strip */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-3">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
            noValidate
          >
            <h2 className="text-base font-semibold tracking-tight" style={{ color: BRAND_GOLD }}>
              Stay connected
            </h2>

            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                disabled={submitting}
                className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition"
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#021347] shadow-md disabled:opacity-60"
              style={{ background: BRAND_GOLD }}
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </motion.button>

            <div className="min-h-[20px] sm:min-w-[180px]">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-1 flex items-center gap-1.5 text-[12px] text-red-300"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-1 flex items-center gap-1.5 text-[12px] text-emerald-300"
                  >
                    <CheckCircle size={14} /> Subscribed!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* Core */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
          {/* Brand blurb */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/10 grid place-items-center">
                <span className="text-[11px] font-bold tracking-wide" style={{ color: BRAND_GOLD }}>
                  DC
                </span>
              </div>
              <span className="font-semibold text-lg" style={{ color: BRAND_GOLD }}>
                Dominion Connect
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Empowering faith communities with seamless connections and spiritual growth tools.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">Contact</h3>
            <ul className="space-y-2 text-sm text-white/75">
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="opacity-80" />
                <a
                  href="mailto:info@winnerschapelnashville.org"
                  className="hover:text-white transition"
                >
                  info@winnerschapelnashville.org
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="opacity-80" />
                5270 Murfreesboro Rd, La Vergne, TN 37086
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">Follow</h3>
            <div className="flex gap-2.5">
              <a
                href="https://facebook.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-white/80" />
              </a>
              <a
                href="https://instagram.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white/80" />
              </a>
              <a
                href="https://youtube.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="YouTube"
              >
                <Youtube size={18} className="text-white/80" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-7 pt-5 border-t border-white/10 text-[12.5px] text-white/65 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dominion Connect. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="/privacy" className="hover:text-white transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
