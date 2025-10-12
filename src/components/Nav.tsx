import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/* ----------------------------- Variants ----------------------------- */

const headerDrop = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

const ctaVariants = {
  rest:   { width: 44,  transition: { type: "spring", stiffness: 220, damping: 22 } },
  hover:  { width: 152, transition: { type: "spring", stiffness: 220, damping: 22 } },
  tap:    { scale: 0.98 },
};

const glowVariants = {
  rest:  { opacity: 0, scale: 0.95 },
  hover: { opacity: 0.3, scale: 1.05, transition: { duration: 0.35 } },
};

const line1 = {
  rest:  { x: 0, rotate: 0, opacity: 1 },
  hover: { x: 6, rotate: 8, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};
const line2 = {
  rest:  { x: 0, rotate: 0, opacity: 1 },
  hover: { x: -6, rotate: -4, opacity: 1, transition: { duration: 0.45, ease: "easeOut", delay: 0.05 } },
};
const line3 = {
  rest:  { x: 0, rotate: 0, opacity: 1 },
  hover: { x: 4, rotate: -8, opacity: 1, transition: { duration: 0.45, ease: "easeOut", delay: 0.1 } },
};

const labelVariants = {
  rest:  { opacity: 0, x: 8, filter: "blur(4px)" },
  hover: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: "easeOut", delay: 0.15 } },
};

/* ------------------------------ Header ------------------------------ */

export default function Header() {
  return (
    <motion.header
      variants={headerDrop}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-extrabold tracking-tight text-red-900 select-none">
            LogaXP
          </div>
        </div>

        {/* Right: Morphing MyPortal CTA (replaces hamburger/login) */}
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          animate="rest"
          className="relative"
        >
          {/* Subtle gradient glow */}
          <motion.div
            variants={glowVariants}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-400 via-blue-900 to-amber-400 blur-xl"
            aria-hidden
          />

          <Link
            to="/login"
            className="relative inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70 shadow-sm overflow-hidden no-underline"
            aria-label="Open MyPortal"
          >
            {/* Animated icon block (three lines) */}
            <motion.div
              variants={ctaVariants}
              className="flex-none h-7 w-11 grid place-items-center rounded-xl"
            >
              <div className="space-y-1.5">
                <motion.span
                  variants={line1}
                  className="block w-6 h-0.5 bg-green-600 rounded-full shadow-sm"
                />
                <motion.span
                  variants={line2}
                  className="block w-6 h-0.5 bg-blue-900 rounded-full shadow-sm"
                />
                <motion.span
                  variants={line3}
                  className="block w-6 h-0.5 bg-amber-400 rounded-full shadow-md"
                />
              </div>
            </motion.div>

            {/* Label appears on hover (morphs from hamburger → button) */}
            <motion.span
              variants={labelVariants}
              className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap pr-1 text-xs"
            >
              MyPortal
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}