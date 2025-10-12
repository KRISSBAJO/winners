import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";

// --- Brand Colors ---
const BRAND_RED = "#9B2C2C";

// --- Background Gradient FX ---
const BackgroundFX = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-48 -left-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-r from-yellow-500/10 to-red-500/10 blur-3xl" />
    <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-r from-red-500/10 to-yellow-500/10 blur-3xl" />
  </div>
);

// --- Interactive Orb ---
const CommunityOrb: React.FC = () => {
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

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="flex items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-64 h-64"
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/30 to-red-500/30 shadow-2xl" />

        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-yellow-300"
              style={{
                transform: `translate(-50%, -50%) rotate(${
                  i * 60
                }deg) translateX(110px) rotate(-${i * 60}deg)`,
              }}
            />
          </motion.div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <UserPlus className="w-16 h-16 text-white/80" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main CTA ---
export default function CallToAction() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <section className="relative py-24 md:py-32 bg-slate-50 dark:bg-slate-950">
      <style>{`
        .glass-pane {
          background-color: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.08);
        }
        .dark .glass-pane {
          background-color: rgba(30, 41, 59, 0.55);
          border-color: rgba(255,255,255,0.1);
        }
      `}</style>

      <BackgroundFX />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-10 items-center glass-pane p-8 md:p-12 rounded-3xl shadow-xl"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          {/* Content */}
          <div className="text-center lg:text-left">
            <motion.h2
              variants={item}
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
            >
              Ready to <span className="text-red-700">Join the Family?</span>
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-4 max-w-lg mx-auto lg:mx-0 text-lg text-slate-600 dark:text-slate-300"
            >
              Get connected today. Register as a new member and become part of
              our growth story, rooted in faith and community.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <a
                href="#"
                className="group inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: BRAND_RED }}
              >
                Register Now{" "}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#"
                className="group inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-white/10 transition"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Orb */}
          <motion.div variants={item} className="hidden lg:flex justify-center">
            <CommunityOrb />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
