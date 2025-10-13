import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import Logo from "../assets/images/logo1.png";

const emailSchema = z.string().email("Invalid email address");

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

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
    <footer className="relative bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-800/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        {/* Newsletter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Stay Connected
          </h2>
          <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-6">
            Get updates on events, messages, and more.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            noValidate
          >
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                disabled={submitting}
                className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-gold-400 transition"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full px-6 py-3 font-medium text-white shadow-md disabled:opacity-50 transition"
              style={{
                background: `linear-gradient(to right, ${BRAND_RED}, ${BRAND_GOLD})`,
              }}
            >
              {submitting ? "Joining..." : "Subscribe"}
            </motion.button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm"
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
                className="mt-3 flex items-center justify-center gap-2 text-green-500 text-sm"
              >
                <CheckCircle size={16} />
                Subscribed successfully!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Divider */}
        <hr className="my-8 border-slate-200 dark:border-slate-800" />

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Dominion Connect
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Empowering faith communities with seamless connections.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-500" />
                <a
                  href="mailto:info@winnerschapelnashville.org"
                  className="hover:text-gold-500 transition"
                >
                  info@winnerschapelnashville.org
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-gold-500" />
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gold-100 dark:hover:bg-gold-900/20 transition"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-slate-600 dark:text-slate-300 hover:text-gold-500" />
              </a>
              <a
                href="https://instagram.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gold-100 dark:hover:bg-gold-900/20 transition"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-slate-600 dark:text-slate-300 hover:text-gold-500" />
              </a>
              <a
                href="https://youtube.com/winnerschapelnashville"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gold-100 dark:hover:bg-gold-900/20 transition"
                aria-label="YouTube"
              >
                <Youtube size={20} className="text-slate-600 dark:text-slate-300 hover:text-gold-500" />
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
          className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-500"
        >
          <p>
            © {new Date().getFullYear()} Dominion Connect. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center gap-6">
            <a href="/privacy" className="hover:text-gold-500 transition">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gold-500 transition">
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}