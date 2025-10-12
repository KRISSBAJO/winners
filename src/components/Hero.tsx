import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* gradient blobs — smaller/softer on mobile */}
        <div className="absolute -top-20 -left-20 w-[26rem] h-[26rem] sm:w-[32rem] sm:h-[32rem] lg:w-[38rem] lg:h-[38rem] rounded-full blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 bg-gradient-to-br from-amber-300 to-rose-300 dark:from-amber-400/40 dark:to-rose-400/40" />
        <div className="absolute bottom-[-12rem] right-[-8rem] w-[28rem] h-[28rem] sm:w-[34rem] sm:h-[34rem] lg:w-[40rem] lg:h-[40rem] rounded-full blur-2xl sm:blur-3xl opacity-15 sm:opacity-20 bg-gradient-to-tr from-indigo-300 to-emerald-300 dark:from-indigo-400/40 dark:to-emerald-400/40" />
        {/* grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.06] sm:opacity-[0.08] dark:opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-700" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-24">
        <div className="grid items-center gap-10 sm:gap-12 lg:gap-16 md:grid-cols-2">
          {/* LEFT: copy */}
          <div className="text-center md:text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 backdrop-blur"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37]" />
              Dominion Connect · WCIN
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.05, duration: reduce ? 0 : 0.45 }}
              className="mt-3 font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] text-slate-900 dark:text-white"
            >
              Connect. Organize.{" "}
              <span className="bg-gradient-to-r from-[#8B0000] to-[#D4AF37] bg-clip-text text-transparent">
                Grow Together.
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.12, duration: reduce ? 0 : 0.45 }}
              className="mt-4 sm:mt-5 mx-auto md:mx-0 max-w-[46ch] text-[15px] sm:text-base text-slate-600 dark:text-slate-300"
            >
              A modern platform for ministries and members — streamline communication, events, and care with excellence.
              Built for speed, clarity, and impact.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.18, duration: reduce ? 0 : 0.45 }}
              className="mt-6 sm:mt-8 flex flex-col xs:flex-row sm:flex-row gap-2.5 sm:gap-3 justify-center md:justify-start"
            >
              <a
                href="#get-started"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold text-white
                           bg-gradient-to-r from-[#8B0000] to-[#D4AF37] shadow-md shadow-amber-500/20 hover:brightness-[1.05] transition"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#learn-more"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold
                           border border-slate-300/60 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur
                           hover:bg-white/90 dark:hover:bg-white/10 transition text-slate-800 dark:text-slate-100"
              >
                <Play className="h-4 w-4" /> See it in action
              </a>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.24, duration: reduce ? 0 : 0.45 }}
              className="mt-6 sm:mt-8 flex flex-wrap justify-center md:justify-start items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400"
            >
              <span className="rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2.5 py-1">Secure & GDPR-ready</span>
              <span className="rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2.5 py-1">99.9% Uptime</span>
              <span className="rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2.5 py-1">Fast onboarding</span>
            </motion.div>
          </div>

          {/* RIGHT: visual */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduce ? 0 : 0.12, type: reduce ? false : "spring", stiffness: 120, damping: 18 }}
            className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-none"
          >
            {/* card: aspect changes by breakpoint for better fit */}
            <div
              className="relative mx-auto aspect-[4/5] sm:aspect-[5/6] md:aspect-[4/5] w-[18rem] sm:w-[22rem] md:w-96
                         rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/85 dark:bg-white/[0.06]
                         backdrop-blur-xl shadow-2xl overflow-hidden"
              aria-label="Dashboard preview"
            >
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="h-2 w-20 sm:w-24 rounded bg-slate-200/80 dark:bg-white/10" />
              </div>

              {/* content */}
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100">Member Directory</p>
                  <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">4,200 active</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {["Leaders", "Ushers", "Choir", "Teens", "Children", "Media"].map((label) => (
                    <div
                      key={label}
                      className="h-20 sm:h-24 rounded-xl border border-slate-200/70 dark:border-white/10
                                 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/[0.02] p-2.5 sm:p-3 flex items-end"
                      aria-label={`${label} group`}
                    >
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</span>
                    </div>
                  ))}
                </div>

                {/* progress */}
                <div className="mt-1.5 sm:mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100">Volunteer Hours Goal</p>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">72% this month</span>
                  </div>
                  <div
                    className="h-8 sm:h-10 w-full rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={72}
                    aria-label="Volunteer hours progress"
                  >
                    <div className="h-full w-[72%] bg-gradient-to-r from-[#8B0000] to-[#D4AF37]" />
                  </div>
                </div>
              </div>
            </div>

            {/* floating stats — size & position per breakpoint */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.25, duration: reduce ? 0 : 0.35 }}
              className="absolute -left-1 sm:-left-3 -top-2 sm:-top-3 rounded-2xl border border-slate-200/70 dark:border-white/10
                         bg-white/95 dark:bg-slate-900/85 backdrop-blur px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl"
              aria-label="Active members stat"
            >
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Active members</p>
              <p className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">4,200+</p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.3, duration: reduce ? 0 : 0.35 }}
              className="absolute right-2 sm:-right-4 bottom-3 sm:bottom-6 rounded-2xl border border-slate-200/70 dark:border-white/10
                         bg-white/95 dark:bg-slate-900/85 backdrop-blur px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl"
              aria-label="Events scheduled this month"
            >
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Events this month</p>
              <p className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">27</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
