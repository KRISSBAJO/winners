import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import HeroImage from "../assets/images/hero2.jpg";
import { Link } from "react-router-dom";

const BRAND_PRIMARY = "#021347";
const BRAND_GOLD = "#D4AF37";

export default function HeroChristian() {
  const reduce = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [isSmall, setIsSmall] = useState(true); // < sm by default

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)"); // sm
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsSmall(!e.matches);
    handler(mq);
    mq.addEventListener?.("change", handler as any);
    return () => mq.removeEventListener?.("change", handler as any);
  }, []);

  const FEATURES = [
    "Member Engagement",
    "Discipleship Tracker",
    "Smart Notifications",
    "Unified Messaging",
    "Care Visit Logs",
    "Insightful Reports",
  ];

  const VISIBLE_FEATURES = !isSmall || showAll ? FEATURES : FEATURES.slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: reduce ? 0 : 0.5, staggerChildren: reduce ? 0 : 0.07 },
    },
  };
  const item = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };

  return (
    <section
      className="relative min-h-[84vh] flex items-center justify-center text-center overflow-hidden"
      aria-label="Dominion Connect hero"
    >
      {/* BG */}
      <img
        src={HeroImage}
        alt="Open Bible"
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
      />

      {/* overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(212,175,55,0.06) 0%, rgba(139,0,0,0.12) 50%, rgba(2,19,71,0.46) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.16) 0%, transparent 60%)" }}
      />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_-160px_240px_-100px_rgba(2,19,71,.65)]" />

      {/* bottom wave */}
      <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 overflow-hidden" aria-hidden>
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
          <path d="M0 120 L0 84 Q360 118 720 82 Q1080 46 1440 82 L1440 120 Z" fill={BRAND_GOLD} opacity="0.9" />
        </svg>
      </div>

      {/* content */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.5 }}
        className="relative z-10 w-full px-4 sm:px-6"
      >
        {/* mobile glass panel for readability; transparent on md+ */}
        <div className="mx-auto max-w-[60rem] rounded-2xl bg-slate-900/35 backdrop-blur-[2px] ring-1 ring-white/10 p-4 sm:p-6 md:bg-transparent md:backdrop-blur-0 md:ring-0">
          {/* icon */}
           {/* icon */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full grid place-items-center bg-gradient-to-br from-[#D4AF37]/90 to-[#8B0000]/90 ring-2 ring-white/25 shadow-xl">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v18M6 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>


          {/* heading */}
          <h1
            className="font-serif text-white drop-shadow-xl mx-auto [text-wrap:balance]"
            style={{ fontSize: "clamp(1.9rem, 6vw, 3.8rem)", lineHeight: 1.12, letterSpacing: ".2px" }}
          >
            Empower Your Ministry:
            <br className="hidden sm:block" />
            <span className="sm:ml-1">Nurture Souls, Not Numbers.</span>
          </h1>

          {/* subline */}
          <p className="mt-3 sm:mt-5 text-white/95 mx-auto text-[15px] sm:text-base leading-relaxed max-w-[46rem]">
            Dominion Connect streamlines administration, fosters genuine connections, and amplifies your impact.
          </p>

          {/* CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="#get-started"
              className="group relative inline-flex items-center justify-center rounded-full px-6 py-3 sm:px-7 sm:py-3.5
                         text-sm font-semibold uppercase text-white shadow-lg focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-white/80 transition-all w-full sm:w-auto"
              style={{ background: BRAND_PRIMARY }}
            >
              <Link to="/get-started" className="relative z-10">Get Started</Link>
              {!reduce && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/25 blur-[2px] transition-transform duration-700 group-hover:translate-x-[260%]" />
                </span>
              )}
            </a>

            <a
              href="#watch-demo"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-semibold uppercase
                         text-white/95 ring-2 ring-white/45 hover:ring-white/70 hover:bg-white/10 backdrop-blur-sm
                         transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80
                         w-full sm:w-auto"
            >
              Watch Demo
            </a>
          </div>

          {/* TAGS GRID — 1 col xs, 2 on sm, 3 on md+; "More features" on mobile */}
          <motion.ul
            variants={container}
            initial="hidden"
            animate="visible"
            className="mt-6 sm:mt-8 mx-auto w-full max-w-[56rem] grid gap-2.5 sm:gap-3
                       grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          >
            {VISIBLE_FEATURES.map((label) => (
              <motion.li
                key={label}
                variants={item}
                className="flex items-center justify-center rounded-full border border-white/30 bg-white/15
                           px-4 py-2 text-[13px] sm:text-[13.5px] text-white/95 backdrop-blur-md
                           hover:bg-white/25 transition-colors"
              >
                {label}
              </motion.li>
            ))}

            {/* Mobile: toggle pill */}
            {isSmall && (
              <button
                onClick={() => setShowAll((s) => !s)}
                className="rounded-full border border-white/30 bg-transparent px-4 py-2 text-[13px] text-white/95
                           hover:bg-white/10 transition-colors"
              >
                {showAll ? "Show less" : "More features"}
              </button>
            )}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}
