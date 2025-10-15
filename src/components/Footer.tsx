import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Youtube, Mail, MapPin, CheckCircle, AlertCircle } from "lucide-react";


const BRAND_GOLD    = "#D4AF37";

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
    // Add your validation logic here
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setEmail("");
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <footer className="relative bg-[#021347] text-white overflow-hidden">
      {/* Subtle gold wave transition */}
      <div className="absolute top-0 left-0 right-0 h-12" style={{ background: BRAND_GOLD, clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0 100%)" }} aria-hidden />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        {/* Newsletter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4" style={{ color: BRAND_GOLD }}>
            Stay Connected
          </h2>
          <p className="text-base lg:text-lg text-white/80 max-w-xl mx-auto mb-8">
            Receive updates on events, inspirational messages, and ministry resources.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
            noValidate
          >
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                disabled={submitting}
                className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:border-gold-400 transition backdrop-blur-sm"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full px-8 py-3 font-medium text-[#021347] shadow-md disabled:opacity-50 transition"
              style={{ background: BRAND_GOLD }}
            >
              {submitting ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center justify-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center justify-center gap-2 text-green-400 text-sm"
              >
                <CheckCircle size={16} />
                Subscribed successfully!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Main Content */}
        <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              {/* Assuming you have a logo component or image */}
              <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-gold-300 font-bold">DC</span>
              </div>
              <span className="font-bold text-lg" style={{ color: BRAND_GOLD }}>
                Dominion Connect
              </span>
            </div>
            <p className="text-sm text-white/70">
              Empowering faith communities with seamless connections and spiritual growth tools.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold" style={{ color: BRAND_GOLD }}>
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold-400" />
                <a
                  href="mailto:info@winnerschapelnashville.org"
                  className="hover:text-gold-300 transition"
                >
                  info@winnerschapelnashville.org
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-gold-400" />
                5270 Murfreesboro Rd, La Vergne, TN 37086
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold" style={{ color: BRAND_GOLD }}>
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-white/70 hover:text-gold-300" />
              </a>
              <a
                href="https://instagram.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-white/70 hover:text-gold-300" />
              </a>
              <a
                href="https://youtube.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
                aria-label="YouTube"
              >
                <Youtube size={20} className="text-white/70 hover:text-gold-300" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/60"
        >
          <p>
            © {new Date().getFullYear()} Dominion Connect. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-6">
            <a href="/privacy" className="hover:text-gold-300 transition">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gold-300 transition">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}