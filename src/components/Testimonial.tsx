import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

type Props = {
  imageUrl?: string;
  quote?: string;
  author?: string;
  role?: string;
  location?: string;
};

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function Testimonial({
  imageUrl = "https://placehold.co/240x240/8B0000/ffffff?text=PC",
  quote = `“In the body of Christ, every soul is a vital thread in the tapestry of faith. This platform weaves us closer, ensuring no one drifts from our shared journey of grace and growth.”`,
  author = "Pst. Chris Adebajo",
  role = "Resident Pastor",
  location = "Winners Chapel International Nashville",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="testimonial-title"
      className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-br from-red-50/50 via-amber-50/30 to-red-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Ambient blobs (very soft) */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-[34rem] h-[34rem] rounded-full bg-amber-300/20 dark:bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[36rem] h-[36rem] rounded-full bg-rose-300/20 dark:bg-rose-400/10 blur-3xl" />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6">
        {/* Section Heading (visually subtle, a11y clear) */}
        <h2 id="testimonial-title" className="sr-only">
          Pastoral Endorsement
        </h2>

        <div className="grid gap-10 lg:grid-cols-[auto,1fr] items-center">
          {/* Portrait rail */}
          <motion.aside
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto lg:mx-0"
          >
            {/* Vertical accent with gradient cap */}
            <div className="absolute -left-6 top-0 bottom-0 hidden lg:block">
              <div className="h-full w-px bg-gradient-to-b from-[var(--start)] via-slate-300/60 to-transparent dark:from-white/30 dark:via-white/10"
                   style={{ ["--start" as any]: BRAND_RED }} />
            </div>

            <div className="relative">
              <img
                src={imageUrl}
                alt={author}
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full object-cover shadow-xl ring-4 ring-white/70 dark:ring-slate-900/70"
                loading="lazy"
              />
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full blur-lg"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(139,0,0,0.18), rgba(212,175,55,0.18), transparent 60%)",
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Author */}
            <div className="mt-5 text-center lg:text-left">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {author}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {role}, {location}
              </p>
            </div>
          </motion.aside>

          {/* Quote block */}
          <motion.blockquote
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative"
          >
            {/* Floating quote glyph */}
            <Quote
              aria-hidden
              className="absolute -top-6 -left-6 w-10 h-10 text-amber-500/60 dark:text-amber-400/50"
            />

            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif leading-relaxed lg:leading-snug text-slate-900 dark:text-slate-50 tracking-tight">
              {quote}
            </p>

            {/* Signature rule */}
            <div className="mt-8 flex items-center gap-4">
              <span
                className="h-px w-24 rounded bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${BRAND_GOLD}, transparent)`,
                }}
              />
              {/* <span className="text-sm text-slate-500 dark:text-slate-400">
                Endorsed by {author}
              </span> */}
            </div>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
