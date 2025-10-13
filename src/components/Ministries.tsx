import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Music, Users, HeartHandshake, HandHeart, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Ministry = {
  title: string;
  desc: string;
  icon: LucideIcon;
  color?: string;   // tailwind gradient tail e.g. "from-red-600/20 via-amber-500/10 to-transparent"
  href?: string;    // optional: make item clickable
};

const MINISTRIES: Ministry[] = [
  { title: "Choir Ministry", desc: "Lifting hearts to heaven through praise and worship. Singing to God", icon: Music, color: "from-red-600/20 via-amber-500/10 to-transparent" },
  { title: "Youth Ministry", desc: "Empowering the next generation with vision and faith.", icon: Users, color: "from-yellow-500/20 via-red-400/10 to-transparent" },
  { title: "Prayer Team", desc: "Standing in the gap and birthing change through intercession.", icon: HandHeart, color: "from-amber-500/25 via-red-600/10 to-transparent" },
  { title: "Hospitality", desc: "Creating a home of love, warmth, and divine welcome.", icon: HeartHandshake, color: "from-red-500/20 via-yellow-400/10 to-transparent" },
];

export default function Ministries({
  items = MINISTRIES,
}: { items?: Ministry[] }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="ministries-title"
      className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-red-50 dark:from-slate-950 dark:via-red-950/10 dark:to-amber-950/20 py-20 sm:py-28"
    >
      {/* Ambient glow (skips if prefers-reduced-motion) */}
      {!reduce && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]" />
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16">
        <motion.h2
          id="ministries-title"
          className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Our Ministries
        </motion.h2>
        <motion.p
          className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Every ministry is a stream of grace — flowing together to build His Kingdom.
        </motion.p>
      </div>

      {/* Content: responsive rail with “halo chips” (less cardy) */}
      <ul className="relative mx-auto max-w-6xl px-6 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((m, i) => {
          const Icon = m.icon;
          const Content = (
            <>
              {/* halo + ring */}
              <div className="absolute inset-0 rounded-3xl">
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${m.color ?? "from-red-600/15 via-amber-500/10 to-transparent"} blur-xl opacity-80`} />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/60 dark:ring-white/10" />
              </div>

              {/* body */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#D4AF37] text-white shadow-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.desc}
                </p>

                {m.href && (
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#8B0000] dark:text-[#D4AF37] group-hover:underline underline-offset-4">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </>
          );

          // Make the whole item a link if href provided; otherwise a div
          const Wrapper: any = m.href ? "a" : "div";

          return (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className="relative"
            >
              <Wrapper
                href={m.href}
                className="group block focus:outline-none rounded-3xl bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl p-5 sm:p-6 shadow hover:shadow-2xl transition-all duration-300
                           focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                {...(m.href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -1.5, 0] }}
                  transition={reduce ? undefined : { duration: 3, repeat: Infinity }}
                >
                  {Content}
                </motion.div>
              </Wrapper>
            </motion.li>
          );
        })}
      </ul>

      {/* Floating sparkle */}
      {!reduce && (
        <Sparkles className="absolute bottom-16 left-1/2 -translate-x-1/2 text-amber-500/40 w-12 h-12" />
      )}
    </section>
  );
}
