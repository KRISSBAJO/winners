import { motion, useInView, Variants } from "framer-motion";
import React, { useRef } from "react";
import { ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Hero Component                               */
/* -------------------------------------------------------------------------- */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });

  const headline = "Building the Kingdom, One Connection at a Time.";
  const headlineWords = headline.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 14 },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-white dark:bg-slate-950"
    >
      {/* Text */}
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-5xl py-16 sm:py-24 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight leading-tight text-slate-900 dark:text-slate-50"
          aria-label={headline}
        >
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-6 sm:mt-10 mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-normal"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Dominion Connect is our digital sanctuary — uniting the WCIN family,
          empowering our spiritual growth, and managing our community with divine
          excellence and purpose.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-white font-medium shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 min-w-[140px] justify-center"
          >
            Get Connected <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="px-6 sm:px-8 py-3.5 rounded-full border border-slate-400/30 hover:border-slate-600/50 text-slate-800 dark:text-slate-200 backdrop-blur-sm transition-all min-w-[140px] justify-center"
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}