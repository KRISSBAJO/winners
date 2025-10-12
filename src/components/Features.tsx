import { Users, UserPlus, BarChart3 } from "lucide-react";
import FeatureCard from "./FeatureCard";
import { motion } from "framer-motion";

/* -------------------------------- Features Section ------------------------------- */
export default function Features() {
  const features = [
    {
      icon: Users,
      title: "Membership Directory",
      description:
        "Maintain a secure and dynamic directory of members with personalized profiles and contact details.",
      delay: 0.1,
    },
    {
      icon: UserPlus,
      title: "New Convert Logs",
      description:
        "Track and nurture new believers seamlessly as they grow and integrate into the church family.",
      delay: 0.2,
    },
    {
      icon: BarChart3,
      title: "Growth Analytics",
      description:
        "Visualize real-time insights and track ministry impact through intuitive reports and dashboards.",
      delay: 0.3,
    },
  ];

  return (
    <section
      id="features"
      className="relative py-28 bg-gradient-to-br from-white via-amber-50/40 to-red-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-amber-950/10"
    >
      {/* Soft background aura */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8B0000]/15 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          A Central Hub for Our Church Family
        </motion.h2>

        <motion.p
          className="mt-4 max-w-2xl mx-auto text-slate-600 dark:text-slate-300 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Everything you need to connect hearts, track growth, and strengthen our
          Kingdom community.
        </motion.p>

        <div className="mt-16 grid md:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}