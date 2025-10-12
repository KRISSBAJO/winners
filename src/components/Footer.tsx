import { useState } from "react";
import { z } from "zod";
import { Facebook, Instagram, Youtube, Mail, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.string().email("Please enter a valid email address");

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

// Brand colors (tuned to your hero)
const COLORS = {
  ivoryFrom: "#FFF9F0",
  ivoryTo: "#FFF3E6",
  gold: "#D4AF37",
  deepBlue: "#0F1B34", // deep navy for text
  goldSoft: "rgba(212, 175, 55, 0.18)",
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      setSubmitting(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setEmail("");
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${COLORS.ivoryFrom} 0%, ${COLORS.ivoryTo} 100%)`,
        color: COLORS.deepBlue,
        "--deepBlue": COLORS.deepBlue,
        "--gold": COLORS.gold,
      } as React.CSSProperties}
      aria-label="Footer"
    >
      {/* Subtle gold dust overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(212,175,55,0.12) 0 12%, transparent 13%)," +
            "radial-gradient(circle at 80% 20%, rgba(212,175,55,0.10) 0 10%, transparent 11%)," +
            "radial-gradient(circle at 50% 80%, rgba(212,175,55,0.08) 0 18%, transparent 19%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8 py-16 lg:py-20">
        {/* Newsletter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Join Our Community
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Receive inspiring messages, event updates, and ministry resources delivered straight to your inbox. Stay connected and grow in faith.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]"
            noValidate
            aria-label="Newsletter signup"
          >
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 px-4 py-3 text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl px-6 py-3 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
              style={{
                  background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                }}
              aria-label="Subscribe to newsletter"
            >
              {submitting ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3 flex items-center justify-center gap-2 text-red-600"
              >
                <AlertCircle size={16} />
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3 flex items-center justify-center gap-2 text-emerald-600"
              >
                <CheckCircle size={16} />
                Thank you for subscribing! Check your email to confirm.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Info blocks */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-8 md:gap-12 text-center md:text-left md:grid-cols-3"
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-deepBlue flex items-center justify-center md:justify-start gap-2">
              <MapPin size={20} className="text-gold" />
              Visit Us
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex items-center justify-center md:justify-start gap-2">
              <span>8918 Old Hickory Blvd</span>
              <br className="md:hidden" />
              <span>Nashville, TN 37221</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-deepBlue flex items-center justify-center md:justify-start gap-2">
              <Mail size={20} className="text-gold" />
              Contact
            </h3>
            <a
              href="mailto:info@winnerschapelnashville.org"
              className="flex items-center justify-center md:justify-start gap-2 text-slate-600 dark:text-slate-400 hover:text-deepBlue underline-offset-2 transition-colors"
              aria-label="Send email to Winners Chapel Nashville"
            >
              info@winnerschapelnashville.org
            </a>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-deepBlue flex items-center justify-center md:justify-start gap-2">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://facebook.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:border-gold/50 hover:shadow-md transition-all shadow-sm"
                aria-label="Follow on Facebook"
              >
                <Facebook size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-gold transition-colors" />
              </a>
              <a
                href="https://instagram.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:border-gold/50 hover:shadow-md transition-all shadow-sm"
                aria-label="Follow on Instagram"
              >
                <Instagram size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-gold transition-colors" />
              </a>
              <a
                href="https://youtube.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 hover:border-gold/50 hover:shadow-md transition-all shadow-sm"
                aria-label="Subscribe on YouTube"
              >
                <Youtube size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-gold transition-colors" />
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* Divider */}
        <motion.hr
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-12 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent dark:via-slate-700/50"
          aria-hidden
        />

        {/* Bottom bar */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400 sm:flex-row"
        >
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
               style={{
                  background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                }}
            >
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-semibold text-deepBlue">
              Dominion Connect
            </span>
          </div>

          <p className="text-center">
            &copy; {new Date().getFullYear()} Winners Chapel Nashville. All rights reserved.
          </p>

          <nav className="flex gap-6">
            <a
              href="/privacy"
              className="hover:text-deepBlue underline-offset-2 transition-colors"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-deepBlue underline-offset-2 transition-colors"
              aria-label="Terms of Service"
            >
              Terms of Service
            </a>
          </nav>
        </motion.footer>
      </div>
    </footer>
  );
}