import { motion, useInView } from "framer-motion";
import { Users, UserPlus, BarChart3 } from "lucide-react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

/* -------------------------------- FeatureCard ------------------------------- */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="relative group bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-amber-100/60 via-white/40 to-red-50/30 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-900 to-amber-600 text-white shadow-md"
        >
          <Icon className="w-8 h-8" />
        </motion.div>

        <h3 className="mt-5 text-2xl font-semibold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="mt-3 text-slate-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
