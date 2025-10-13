// src/sections/Features.tsx
import { motion, useReducedMotion } from "framer-motion";
import { Users, UserPlus, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  { icon: Users, title: "Membership Directory", description: "Maintain a secure, living directory with rich profiles, roles, and contact preferences." },
  { icon: UserPlus, title: "New Convert Logs", description: "Shepherd new believers with guided follow-up, milestones, and care assignments." },
  { icon: BarChart3, title: "Growth Analytics", description: "See ministry impact at a glance with real-time dashboards and exportable reports." },
];

export default function Features() {
  const reduce = useReducedMotion();

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-white via-amber-50/30 to-red-50/10 dark:from-slate-950 dark:via-red-950/20 dark:to-amber-950/10 overflow-hidden"
    >
      {/* Decorative headline (kept as a single H2 for hierarchy) */}
      <h2
        id="features-title"
        className="text-center text-3xl sm:text-4xl md:text-5xl font-serif font-light text-slate-900 dark:text-white"
      >
        A modern ministry{" "}
        <span className="bg-gradient-to-r from-[#8B0000] to-[#D4AF37] bg-clip-text text-transparent">
          operating system
        </span>
        .
      </h2>

      {/* Optional supporting line (not a second H2) */}
      <p className="mt-3 text-center text-slate-600 dark:text-slate-300">
        Designed for clarity and speed—focus on people, not paperwork.
      </p>

      {/* Ambient background blobs (respect reduced motion) */}
      {!reduce && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full bg-gradient-to-br from-[#D4AF37]/15 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-[#8B0000]/15 to-transparent blur-3xl" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-10 lg:mt-14">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left intro chip moved here so we don’t have two H2s */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto lg:mx-0"
          >
            <p className="inline-flex items-center gap-2 rounded-full border mb-20 border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37]" />
              Dominion Connect · Core
            </p>
            <p className="text-slate-700 dark:text-slate-300 max-w-md mx-auto lg:mx-0">
            Built from the ground up for churches, Dominion Connect is a secure,
            mobile-first platform that streamlines member management, new convert
            follow-up, and ministry reporting.
          </p>
          </motion.div>
          

          {/* Feature Rail */}
          <div className="relative">
            {/* Vertical rail — stronger in dark mode */}
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#8B0000]/50 via-[#D4AF37]/50 to-transparent dark:from-[#D4AF37]/50 dark:via-[#8B0000]/40" />
            <ul className="space-y-8 sm:space-y-10">
              {FEATURES.map((f, i) => (
                <FeatureRow key={f.title} index={i} {...f} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
  index,
}: Feature & { index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="relative pl-14 sm:pl-16"
    >
      {/* Node on the divider */}
      <div className="absolute left-0 sm:left-2 top-2 -translate-x-1/2 sm:translate-x-0">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8B0000] to-[#D4AF37] shadow-lg ring-4 ring-white/70 dark:ring-slate-950/70 flex items-center justify-center">
            <Icon className="h-4 w-4 text-white" />
          </div>
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md bg-gradient-to-br from-[#8B0000]/30 to-[#D4AF37]/30"
              animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            />
          )}
        </div>
      </div>

      {/* Content (now focusable for keyboard users) */}
      <div
        tabIndex={0}
        className="group outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D4AF37] focus-visible:rounded-xl focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <motion.div
            className="h-px w-24 sm:w-32 bg-gradient-to-r from-[#D4AF37] to-transparent opacity-70"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          />
        </div>

        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full border border-slate-300/60 dark:border-white/15 text-slate-700 dark:text-slate-200">
            Secure by design
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full border border-slate-300/60 dark:border-white/15 text-slate-700 dark:text-slate-200">
            Mobile-first
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full border border-slate-300/60 dark:border-white/15 text-slate-700 dark:text-slate-200">
            Real-time updates
          </span>
        </div>
      </div>
    </motion.li>
  );
}
