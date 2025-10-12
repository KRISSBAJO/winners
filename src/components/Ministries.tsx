import { motion } from "framer-motion";
import React from "react";
import {
  Sparkles,
  Music,
  Users,
  HeartHandshake,
  HandHeart, // ✅ valid Lucide icon
} from "lucide-react";

export default function Ministries() {
  const ministries = [
    {
      title: "Choir Ministry",
      desc: "Lifting hearts to heaven through praise and worship.",
      icon: Music,
      color: "from-red-600/20 via-amber-500/10 to-transparent",
    },
    {
      title: "Youth Ministry",
      desc: "Empowering the next generation with vision and faith.",
      icon: Users,
      color: "from-yellow-500/20 via-red-400/10 to-transparent",
    },
    {
      title: "Prayer Team",
      desc: "Standing in the gap and birthing change through intercession.",
      icon: HandHeart, // ✅ swapped for a valid Lucide icon
      color: "from-amber-500/25 via-red-600/10 to-transparent",
    },
    {
      title: "Hospitality",
      desc: "Creating a home of love, warmth, and divine welcome.",
      icon: HeartHandshake,
      color: "from-red-500/20 via-yellow-400/10 to-transparent",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-white via-amber-50/40 to-red-50 dark:from-slate-950 dark:via-red-950/10 dark:to-amber-950/20">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)] animate-pulse" />
      </div>

      {/* Heading */}
      <div className="text-center mb-20 relative">
        <motion.h2
          className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white drop-shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Ministries
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Every ministry is a stream of grace — flowing together to build His Kingdom.
        </motion.p>
      </div>

      {/* Ministries */}
      <div className="relative max-w-6xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {ministries.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              className="relative group rounded-3xl p-[2px] bg-gradient-to-br from-red-800/10 to-amber-400/10 hover:from-red-700/30 hover:to-amber-400/20 transition-all duration-500 shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <div className="relative rounded-3xl h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
                <div className={`absolute inset-0 bg-gradient-to-b ${m.color} opacity-70 rounded-3xl blur-2xl`} />
                <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#8B0000] to-[#D4AF37] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm">
                    {m.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Sparkles */}
      <Sparkles className="absolute bottom-20 left-1/2 -translate-x-1/2 text-amber-500/40 w-12 h-12 animate-pulse" />
    </section>
  );
}
