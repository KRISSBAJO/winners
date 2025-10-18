import React, { useState } from 'react';
import { ArrowRight, Users, MessageSquare, CheckCircle2, X, Star, ShieldCheck, Zap, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---- Brand ---- */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const BRAND_PRIMARY = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* ---------------------------------- TYPES --------------------------------- */
type Feature = {
  icon: React.ElementType;
  title: string;
  text: string;
};

type ModalContent = {
  title: string;
  keyFeatures: {
    icon: React.ElementType;
    title: string;
    description: string;
  }[];
  useCase: {
    scenario: string;
    solution: string;
  };
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
};

/* -------------------------------- MOCK DATA ------------------------------- */
const featuresData: Feature[] = [
    {
      icon: Users,
      title: "Membership & Care",
      text: "Households, profiles, visits, and notes—kept together with grace and clarity.",
    },
    {
      icon: MessageSquare,
      title: "Follow-up & Messaging",
      text: "Automated workflows, tasks, and SMS/Email in one quiet, reliable place.",
    },
    {
      icon: CheckCircle2,
      title: "Guided Onboarding",
      text: "White-glove setup and data import to help your team start strong.",
    },
];

const modalData: Record<string, ModalContent> = {
  "Membership & Care": {
    title: "Deepen Your Community with Membership & Care",
    keyFeatures: [
      { icon: Users, title: "Unified Household Profiles", description: "See the complete picture of every family, including members, key dates, and contact info, all in one place." },
      { icon: CheckCircle2, title: "Pastoral Visit Tracking", description: "Log hospital visits, counseling sessions, and check-ins with confidential notes to ensure no one falls through the cracks." },
      { icon: Star, title: "Customizable Fields & Groups", description: "Organize your congregation into small groups, volunteer teams, or leadership boards with tags and custom fields." },
    ],
    useCase: {
      scenario: "A new family visits your church. How do you ensure they feel seen and connected?",
      solution: "Quickly create a new household profile, add them to a 'New Visitors' group which triggers a welcome email, and assign a follow-up task to a pastor for a personal call the next day."
    },
    testimonial: {
      quote: "This has revolutionized how we care for our people. We're more organized and intentional than ever before.",
      author: "Pastor John Doe",
      role: "Lead Pastor, Grace Fellowship",
    },
    faqs: [
      { question: "Can we import our existing member data?", answer: "Yes, our Guided Onboarding includes a full data import from your existing spreadsheets or church management system." },
      { question: "Is the information secure?", answer: "Absolutely. All data is encrypted, and you can set granular permissions for staff and key volunteers." },
    ]
  },
  "Follow-up & Messaging": {
    title: "Never Miss a Moment with Follow-up & Messaging",
    keyFeatures: [
      { icon: Zap, title: "Automated Workflows", description: "Create step-by-step follow-up plans for new visitors, salvation decisions, or prayer requests that run automatically." },
      { icon: MessageCircle, title: "Integrated SMS & Email", description: "Send bulk messages or personalized notes directly from the platform without needing a separate service." },
      { icon: ShieldCheck, title: "Task Management for Teams", description: "Assign follow-up tasks to staff or volunteers and track their completion to ensure accountability and care." },
    ],
    useCase: {
      scenario: "Someone requests prayer during a service. How do you coordinate a response?",
      solution: "A 'Prayer Request' workflow is triggered. It notifies the prayer team, assigns a pastor to follow up within 24 hours, and sends an encouraging SMS to the individual."
    },
    testimonial: {
      quote: "The automated workflows are a game-changer. Our follow-up process is now consistent, reliable, and incredibly efficient.",
      author: "Jane Smith",
      role: "Connections Director, CityLight Church",
    },
    faqs: [
      { question: "Do we need a separate phone number for SMS?", answer: "No, we can provision a dedicated number for your church, or in some cases, use an existing one." },
      { question: "Can we track who opens our emails?", answer: "Yes, basic analytics like open and click rates are included for all email communications." },
    ]
  },
  "Guided Onboarding": {
    title: "Start Strong with White-Glove Guided Onboarding",
    keyFeatures: [
      { icon: Users, title: "Dedicated Onboarding Specialist", description: "You'll be paired with an expert who will guide you through every step of the setup and launch process." },
      { icon: CheckCircle2, title: "Full Data Migration", description: "We handle the heavy lifting of securely importing your member data from your previous system or spreadsheets." },
      { icon: Star, title: "Personalized Team Training", description: "We'll host live training sessions tailored to your church's specific needs and workflows to ensure your team is confident." },
    ],
    useCase: {
      scenario: "Your team is busy and hesitant to learn a new system. How do you ensure a smooth transition?",
      solution: "Our specialist works around your schedule, handles the technical data work, and provides engaging training that focuses on the features your team will use most, building excitement and confidence."
    },
    testimonial: {
      quote: "The onboarding process was flawless. They took care of everything and trained our team with incredible patience and expertise.",
      author: "Mark Davis",
      role: "Executive Pastor, The Oaks Church",
    },
    faqs: [
      { question: "How long does onboarding take?", answer: "A typical onboarding process takes 2-4 weeks, depending on the complexity of your data and your team's availability." },
      { question: "Is there support after we go live?", answer: "Yes! All plans include ongoing access to our friendly support team via email and chat." },
    ]
  }
};


/* ----------------------------- MODAL COMPONENT --------------------------- */
const FeatureModal = ({
  content,
  onClose,
}: {
  content: ModalContent;
  onClose: () => void;
}) => {
  // A simple prop for the demo button, can be removed if not needed.
  const reduce = false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-[1px] shadow-2xl bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}, rgba(212,175,55,0.2))`
        }}
      >
        <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
          
          <h2 className="font-serif text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", lineHeight: 1.2 }}>
            {content.title}
          </h2>

          <div className="mt-6 space-y-8">
            {/* Key Features */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Key Features</h3>
              <div className="mt-4 space-y-4">
                {content.keyFeatures.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: BRAND_RED }}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Use Case */}
            <section className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">In Practice</h3>
                <p className="mt-2 text-sm italic text-slate-700 dark:text-slate-300">"{content.useCase.scenario}"</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{content.useCase.solution}</p>
            </section>

            {/* Testimonial */}
             <section className="relative text-center">
                <p className="font-serif text-lg italic text-slate-800 dark:text-slate-200">"{content.testimonial.quote}"</p>
                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">{content.testimonial.author}, <span className="font-normal">{content.testimonial.role}</span></p>
            </section>

            {/* CTA */}
            <section className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Ready to See It in Action?</h3>
                 <a
                    href="/get-started"
                    className="group relative inline-flex items-center justify-center rounded-full px-7 py-3.5 mt-4
                               text-sm font-semibold uppercase text-white shadow-lg focus-visible:outline-none
                               focus-visible:ring-2 focus-visible:ring-white/80 transition-all w-full sm:w-auto"
                    style={{ background: BRAND_PRIMARY }}
                  >
                    <span className="relative z-10">Book a Demo</span>
                    {!reduce && (
                      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/25 blur-[2px] transition-transform duration-700 group-hover:translate-x-[260%]" />
                      </span>
                    )}
                  </a>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


/* --------------------------- MAIN COMPONENT -------------------------- */
export default function SignatureCtaSuite({
  primaryHref = "/get-started",
  headline = "A Ministry Suite with Care at the Center",
  subline = "Membership, follow-up, messaging, and visits—beautifully connected so your team can serve with excellence.",
}: {
  primaryHref?: string;
  headline?: string;
  subline?: string;
}) {
  const [selectedFeature, setSelectedFeature] = useState<ModalContent | null>(null);

  const openModal = (featureTitle: string) => {
    setSelectedFeature(modalData[featureTitle]);
  };

  const closeModal = () => {
    setSelectedFeature(null);
  };

  return (
    <>
      <section id="suite" className="relative overflow-hidden" aria-labelledby="suite-title">
        <div aria-hidden className="absolute inset-0 -z-10" style={{
            background: "radial-gradient(80rem 60rem at 10% -20%, rgba(212,175,55,0.10), transparent 55%)," +
                        "radial-gradient(80rem 60rem at 110% 0%, rgba(139,0,0,0.08), transparent 50%)," +
                        "linear-gradient(180deg, #fff 0%, #fff7ef 22%, #ffffff 60%)",
        }} />

        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/70 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GOLD }} aria-hidden />
              Designed for real pastoral work
            </span>
            <h2 id="suite-title" className="mt-4 font-serif text-slate-900" style={{ fontSize: "clamp(1.9rem, 4.2vw, 3rem)", lineHeight: 1.15 }}>
              {headline}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 text-[15px] sm:text-base">{subline}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ icon: Icon, title, text }) => (
              <article key={title} className="relative rounded-2xl p-[1px] shadow-[0_12px_40px_-20px_rgba(2,19,71,.20)] transition-transform hover:-translate-y-0.5 bg-gradient-to-br"
                       style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}, rgba(212,175,55,0)), linear-gradient(0deg, #ffffff, #ffffff)` }}>
                <div className="rounded-2xl bg-white p-5 h-full flex flex-col">
                  <div className="mb-4 inline-grid place-items-center rounded-full p-[2px] shadow" style={{ background: `conic-gradient(from 220deg, ${BRAND_GOLD}, ${BRAND_RED})` }} aria-hidden>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
                      <Icon className="h-5 w-5" style={{ color: BRAND_RED }} />
                    </div>
                  </div>
                  <h3 className="text-slate-900 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 flex-grow">{text}</p>
                  <div className="mt-3">
                    <button
                      onClick={() => openModal(title)}
                      className="inline-flex items-center gap-1 text-[13px] font-medium group"
                      style={{ color: BRAND_RED }}
                    >
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />

          <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:gap-4">
            <div className="text-slate-700 text-sm sm:text-[15px]">
              Ready to streamline ministry and grow healthy follow-up?
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href={primaryHref} className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-[1.05] transition" style={{ background: BRAND_PRIMARY }}>
                Book a Walkthrough
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
              <a href="/watch-demo" className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-300/80 bg-white hover:bg-slate-50 transition">
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedFeature && (
          <FeatureModal content={selectedFeature} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
}
