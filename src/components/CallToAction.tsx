import React from "react";
import { motion, useReducedMotion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";
// If you use react-router, uncomment the next line
// import { Link } from "react-router-dom";

/* --------------------------- Brand & Config --------------------------- */
const BRAND_RED = "#8B0000";

type CTAProps = {
  title?: string;
  blurb?: string;
  registerHref?: string;         // use when navigating by URL
  learnHref?: string;
  onRegisterClick?: () => void;  // or use callbacks
  onLearnClick?: () => void;
  id?: string;                   // for section/anchor links
};

const BackgroundFX = () => (
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-r from-amber-300/20 to-rose-300/20 blur-3xl" />
    <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-gradient-to-r from-rose-300/20 to-amber-300/20 blur-3xl" />
  </div>
);

/* ------------------------------ Orb ---------------------------------- */
const CommunityOrb: React.FC<{ reduced?: boolean }> = ({ reduced }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const onMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // Reduced-motion: render a static badge for perf & accessibility
  if (reduced) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-500/30 shadow-2xl grid place-items-center">
          <UserPlus className="w-14 h-14 text-white/85" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="flex items-center justify-center"
      style={{ perspective: "1000px" }}
      aria-hidden
    >
      <motion.div className="relative w-64 h-64" style={{ transformStyle: "preserve-3d", rotateX, rotateY }}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-500/30 shadow-2xl" />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18 + i * 5, repeat: Infinity, ease: "linear" }}
          >
            <motion.span
              className="absolute top-1/2 left-1/2 block w-3 h-3 rounded-full bg-amber-300"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(110px) rotate(-${i * 60}deg)`,
              }}
            />
          </motion.div>
        ))}

        <div className="absolute inset-0 grid place-items-center">
          <UserPlus className="w-16 h-16 text-white/85" />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------------------- Main Section --------------------------- */
export default function CallToAction({
  title = "Ready to Join the Family?",
  blurb = "Register as a new member and become part of our growth story—rooted in faith and community.",
  registerHref = "#",
  learnHref = "#",
  onRegisterClick,
  onLearnClick,
  id = "cta",
}: CTAProps) {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 16 } },
  };

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
      <BackgroundFX />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-10 items-center rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-8 md:p-12 shadow-xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={container}
        >
          {/* Copy */}
          <div className="text-center lg:text-left">
            <motion.h2
              id={`${id}-title`}
              variants={item}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              {title.split(" ").slice(0, 2).join(" ")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--red)] to-amber-500"
                    style={{ ["--red" as any]: BRAND_RED }}>
                {title.split(" ").slice(2).join(" ") || "Today"}
              </span>
            </motion.h2>

            <motion.p variants={item} className="mt-4 max-w-lg mx-auto lg:mx-0 text-lg text-slate-700 dark:text-slate-300">
              {blurb}
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              {/* If using react-router, swap <a> for <Link to={registerHref}> */}
              <a
                href={registerHref}
                onClick={onRegisterClick}
                className="group inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40"
                style={{ backgroundColor: BRAND_RED }}
              >
                Register Now
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>

              <a
                href={learnHref}
                onClick={onLearnClick}
                className="group inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold border border-slate-300/70 dark:border-white/15 text-slate-800 dark:text-white bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-white/15 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div variants={item} className="flex justify-center">
            {/* Show animated orb on large screens; static on small or if reduced motion */}
            <div className="hidden sm:block">
              <CommunityOrb reduced={!!reduce} />
            </div>
            <div className="sm:hidden">
              <CommunityOrb reduced /> {/* mobile-friendly static */}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
