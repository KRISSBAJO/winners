// src/pages/MinistryDetailPage.tsx
import React, { useMemo, useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Users, Music, HeartHandshake, HandHeart, Star,
  Quote, Image as ImageIcon, Clock, CheckCircle2, ChevronDown, Mail, Phone, MapPin
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ────────────────────────────────────────────────────────────────────────── */
/* Brand */
const BRAND_RED  = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT   = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

/* ────────────────────────────────────────────────────────────────────────── */
/* Types */
type Stat = { label: string; value: string };
type Highlight = { title: string; desc: string; icon?: LucideIcon };
type ScheduleItem = { label: string; value: string };
type Program = { title: string; when: string; where?: string; blurb: string };
type Person = { name: string; role: string; photo?: string };
type Testimony = { quote: string; name: string; meta?: string; avatar?: string };
type Faq = { q: string; a: string };

type Detail = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  color?: string;
  hero?: {
    image?: string;
    overlay?: string; // css linear-gradient
    kicker?: string;
  };
  about: string;
  stats?: Stat[];
  highlights?: Highlight[];
  schedule?: ScheduleItem[];
  gallery?: string[];
  programs?: Program[];
  team?: Person[];
  testimonies?: Testimony[];
  faq?: Faq[];
  contact?: { email?: string; phone?: string; location?: string; cta?: { label: string; href: string } };
};

/* ────────────────────────────────────────────────────────────────────────── */
/* MOCK CONTENT – polish or replace per ministry */
const DETAILS: Record<string, Detail> = {
  "choir-ministry": {
    title: "Choir Ministry",
    subtitle: "Worship • Harmony • Presence",
    icon: Music,
    color: BRAND_GOLD,
    hero: {
      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.55))",
      kicker: "EXPERIENCE HEAVENLY PRAISE",
    },
    about:
      "The Choir Ministry leads the congregation into vibrant, Christ-centered worship. We train voices and hearts, cultivate musical excellence, and create a space where people encounter the presence of God.",
    stats: [
      { label: "Vocalists", value: "48" },
      { label: "Band & Tech", value: "16" },
      { label: "Worship Nights / yr", value: "12+" },
      { label: "Original Songs", value: "8" },
    ],
    highlights: [
      { title: "Vocal Academy", desc: "Breath, tone, harmony & blend workshops.", icon: Star },
      { title: "Band Integration", desc: "Weekly sets with MD & click/guide." },
      { title: "Production", desc: "In-ear mixes, broadcast audio, lighting cues." },
    ],
    schedule: [
      { label: "Rehearsals", value: "Thursdays · 6:30 PM" },
      { label: "Sunday Sets", value: "9:00 AM & 11:00 AM" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521337588524-44e9bde74a39?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop",
    ],
    programs: [
      { title: "New Vocalist Onboarding", when: "Monthly", where: "Room 203", blurb: "Auditions, vocal health, mic technique, blend." },
      { title: "Songwriting Circle", when: "2nd Tuesdays · 7:00 PM", where: "Green Room", blurb: "Collaborative writing & devotionals." },
      { title: "Worship Nights", when: "Monthly Fridays", blurb: "Extended praise, testimonies, and prayer." },
    ],
    team: [
      { name: "Grace Okoye", role: "Worship Pastor", photo: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=400&auto=format&fit=crop" },
      { name: "Daniel Mensah", role: "Music Director", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop" },
      { name: "Maya Brown", role: "Vocal Lead", photo: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=400&auto=format&fit=crop" },
      { name: "Leo Park", role: "FOH Engineer", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop" },
    ],
    testimonies: [
      { quote: "I found both family and calling here. God meets us in every rehearsal.", name: "Ruth A.", meta: "Soprano", avatar: "" },
      { quote: "Excellence + presence. Serving on this team changed my walk.", name: "Kwame N.", meta: "Drummer" },
    ],
    faq: [
      { q: "Do I need prior experience?", a: "No. We’ll place you in a training path suited to your skill level." },
      { q: "Are auditions required?", a: "For vocalists & band, yes—friendly and pastoral, promise." },
      { q: "Time commitment?", a: "Typically 1 rehearsal + 1–2 services per week based on rotation." },
    ],
    contact: {
      email: "choir@yourchurch.org",
      phone: "+1 (615) 222-3344",
      location: "Green Room / Auditorium",
      cta: { label: "Apply to Join", href: "/signup/choir" },
    },
  },

  "youth-ministry": {
    title: "Youth Ministry",
    subtitle: "Faith with Fire",
    icon: Users,
    color: BRAND_RED,
    hero: {
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.6))",
      kicker: "NEXT-GEN DISCIPLES",
    },
    about:
      "We disciple teenagers through Scripture, belonging, and mission. With small groups, retreats, and creative labs, there’s a place for every teen to grow and lead.",
    stats: [
      { label: "Students", value: "120+" },
      { label: "Small Groups", value: "10" },
      { label: "Leaders", value: "24" },
      { label: "Annual Camp", value: "1" },
    ],
    highlights: [
      { title: "Groups", desc: "Grade-based circles for real talk and growth." },
      { title: "Creative Lab", desc: "Music, media, dance, drama—all welcome." },
      { title: "Outreach", desc: "Serve neighborhoods, schools, and shelters." },
    ],
    schedule: [{ label: "Youth Night", value: "Fridays · 6:30 PM" }],
    programs: [
      { title: "Student Leadership Track", when: "Sept–May", blurb: "Mentored pathway to lead with character." },
      { title: "Youth Camp", when: "Summer", blurb: "Encounter God, forge friendships, have fun." },
    ],
    team: [
      { name: "Tolu Adebayo", role: "Youth Pastor", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
      { name: "Sophie Lin", role: "Small Groups Lead", photo: "https://images.unsplash.com/photo-1544005313-ff7b3bbad3fa?q=80&w=400&auto=format&fit=crop" },
    ],
    testimonies: [
      { quote: "I discovered my voice and my faith soared.", name: "Jasmine R.", meta: "Grade 11" },
    ],
    faq: [
      { q: "Is there a ride program?", a: "Yes—contact us mid-week to arrange pickup." },
      { q: "Is it safe?", a: "All leaders are background-checked & trained." },
    ],
    contact: {
      email: "youth@yourchurch.org",
      phone: "+1 (615) 222-1123",
      location: "Student Center",
      cta: { label: "Join Youth Night", href: "/signup/youth" },
    },
  },

  "prayer-team": {
    title: "Prayer Team",
    subtitle: "Standing in the Gap",
    icon: HandHeart,
    color: BRAND_GOLD,
    hero: {
      image:
        "https://images.unsplash.com/photo-1504051771394-dd2e66b2e08f?q=80&w=1600&auto=format&fit=crop",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55))",
      kicker: "WATCHMEN ON THE WALL",
    },
    about:
      "We cover the church in intercession—leaders, families, campuses, and nations. If you’re stirred for prayer, there’s a place for you here.",
    stats: [
      { label: "Prayer Sets / wk", value: "8" },
      { label: "Intercessors", value: "60" },
      { label: "Requests / mo", value: "200+" },
      { label: "Prayer Walks", value: "Weekly" },
    ],
    highlights: [
      { title: "Intercession Sets", desc: "Morning & evening sets with Scripture." },
      { title: "Prayer Requests", desc: "Confidential care and follow-up." },
      { title: "Prayer Walks", desc: "Neighborhood intercession routes." },
    ],
    schedule: [
      { label: "Morning Watch", value: "Tuesdays · 6:00 AM" },
      { label: "Evening Watch", value: "Wednesdays · 7:00 PM" },
    ],
    programs: [
      { title: "Foundations of Intercession", when: "Quarterly", blurb: "Training on hearing, agreement, and authority." },
    ],
    team: [
      { name: "Evelyn K.", role: "Prayer Lead", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop" },
    ],
    testimonies: [
      { quote: "Prayer changed our family. Miracles followed unity.", name: "Ade & Fola", meta: "Parents" },
    ],
    faq: [
      { q: "Can I submit a request?", a: "Yes—visit the Welcome Desk or email us anytime." },
      { q: "Do you fast together?", a: "Monthly 1-day & quarterly 3-day fasts (optional)." },
    ],
    contact: {
      email: "prayer@yourchurch.org",
      phone: "+1 (615) 333-8899",
      location: "Prayer Chapel",
      cta: { label: "Join Prayer Team", href: "/signup/prayer" },
    },
  },

  "hospitality": {
    title: "Hospitality",
    subtitle: "Welcome Home",
    icon: HeartHandshake,
    color: BRAND_RED,
    hero: {
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.55))",
      kicker: "LOVE MADE VISIBLE",
    },
    about:
      "From parking to lobby to seating—we make church feel like home with warmth, excellence, and care. Smiles are our uniform.",
    stats: [
      { label: "Greeters", value: "40" },
      { label: "Ushers", value: "30" },
      { label: "Newcomers / mo", value: "150+" },
      { label: "Follow-ups / wk", value: "50+" },
    ],
    highlights: [
      { title: "Guest Care", desc: "Meet, guide, and connect first-timers." },
      { title: "Ushering", desc: "Seating, offering, and special moments." },
      { title: "Parking & Safety", desc: "Hospitality starts at the gate." },
    ],
    schedule: [{ label: "Team Huddle", value: "Sundays · 8:15 AM" }],
    team: [
      { name: "Samuel O.", role: "Hospitality Lead", photo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop" },
    ],
    testimonies: [
      { quote: "We felt at home from our first minute on campus.", name: "The Millers" },
    ],
    faq: [
      { q: "What should I wear?", a: "Comfortable & neat—smiles required." },
      { q: "Training provided?", a: "Yes. We coach every new volunteer." },
    ],
    contact: {
      email: "hospitality@yourchurch.org",
      phone: "+1 (615) 444-9900",
      location: "Lobby & Auditorium",
      cta: { label: "Serve with Us", href: "/signup/hospitality" },
    },
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Utilities */
const Section: React.FC<{ id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ id, title, icon, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="flex items-center gap-2 text-slate-900">
      {icon} <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const StatChip: React.FC<Stat> = ({ label, value }) => (
  <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm px-4 py-3 text-center">
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</div>
  </div>
);

/* Simple accordion for FAQs */
const FaqItem: React.FC<Faq> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border bg-white p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="font-medium text-slate-800">{q}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-slate-600 text-sm">{a}</p>}
    </div>
  );
};

/* Sticky sub-nav with scrollspy */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

/* ────────────────────────────────────────────────────────────────────────── */
export default function MinistryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const detail = slug ? DETAILS[slug] : undefined;
    const navigate = useNavigate();

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm text-slate-800 shadow"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ministries
        </button>
        <h1 className="mt-6 text-2xl font-semibold">Ministry not found</h1>
        <p className="mt-2 text-slate-600">Add mock content for this slug in <code>DETAILS</code>.</p>
      </div>
    );
  }

  const Icon = (detail.icon ?? Users) as LucideIcon;

  const sections = useMemo(
    () =>
      [
        { id: "about", label: "About" },
        { id: "highlights", label: "Highlights", show: !!detail.highlights?.length },
        { id: "schedule", label: "Schedule", show: !!detail.schedule?.length },
        { id: "gallery", label: "Gallery", show: !!detail.gallery?.length },
        { id: "programs", label: "Programs", show: !!detail.programs?.length },
        { id: "team", label: "Team", show: !!detail.team?.length },
        { id: "testimonies", label: "Testimonies", show: !!detail.testimonies?.length },
        { id: "faq", label: "FAQ", show: !!detail.faq?.length },
        { id: "contact", label: "Contact" },
      ].filter((s) => s.show !== false),
    [detail]
  );

  const active = useScrollSpy(sections.map((s) => s.id));

  return (
    <div className="bg-white">
      {/* HERO */}
      <header className="relative">
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
          {detail.hero?.image ? (
            <img src={detail.hero.image} alt={detail.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-50 to-red-50" />
          )}
          <div className="absolute inset-0" style={{ background: detail.hero?.overlay ?? "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.55))" }} />
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              {detail.hero?.kicker && (
                <div className="text-xs tracking-[.25em] uppercase text-white/80">{detail.hero.kicker}</div>
              )}
              <h1 className="mt-2 text-3xl md:text-4xl font-serif text-white drop-shadow">
                {detail.title}
              </h1>
              {detail.subtitle && <p className="mt-2 text-white/90">{detail.subtitle}</p>}
              <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800 shadow">
                <span
                  className="grid place-items-center w-8 h-8 rounded-lg text-white"
                  style={{ background: GRADIENT }}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span>Ministry</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Back link */}
        <div className="absolute left-4 top-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm text-slate-800 shadow"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </header>

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-6">
          <ul className="flex flex-wrap items-center gap-3 py-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm transition ${
                    active === s.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* BODY */}
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-14">
        {/* STATS */}
        {detail.stats?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {detail.stats.map((st, i) => (
              <StatChip key={i} {...st} />
            ))}
          </div>
        ) : null}

        {/* ABOUT */}
        <Section id="about" title="About" icon={<Users className="w-5 h-5 text-slate-500" />}>
          <div className="grid gap-8 lg:grid-cols-3">
            <p className="lg:col-span-2 text-slate-700 leading-relaxed">
              {detail.about}
            </p>
            {/* quick schedule card */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border bg-white shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Schedule
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {detail.schedule?.length
                    ? detail.schedule.map((s, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span className="text-slate-500">{s.label}</span>
                          <span className="font-medium">{s.value}</span>
                        </li>
                      ))
                    : <li className="text-slate-500">Details coming soon.</li>}
                </ul>
              </div>
            </aside>
          </div>
        </Section>

        {/* HIGHLIGHTS */}
        {detail.highlights?.length ? (
          <Section id="highlights" title="Highlights" icon={<CheckCircle2 className="w-5 h-5 text-slate-500" />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.highlights.map((h, i) => {
                const Ico = h.icon ?? Star;
                return (
                  <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center w-9 h-9 rounded-lg text-white" style={{ background: GRADIENT }}>
                        <Ico className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-semibold text-slate-800">{h.title}</h4>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{h.desc}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        ) : null}

        {/* GALLERY */}
        {detail.gallery?.length ? (
          <Section id="gallery" title="Gallery" icon={<ImageIcon className="w-5 h-5 text-slate-500" />}>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
              {detail.gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${detail.title} ${i + 1}`}
                  className="mb-4 w-full break-inside-avoid rounded-xl shadow-sm hover:opacity-95 transition"
                  loading="lazy"
                />
              ))}
            </div>
          </Section>
        ) : null}

        {/* PROGRAMS / TIMELINE */}
        {detail.programs?.length ? (
          <Section id="programs" title="Programs" icon={<Calendar className="w-5 h-5 text-slate-500" />}>
            <ol className="relative border-l pl-6 space-y-6">
              {detail.programs.map((p, i) => (
                <li key={i} className="relative">
                  <span
                    className="absolute -left-3 top-1.5 w-6 h-6 rounded-full grid place-items-center text-white text-xs font-bold"
                    style={{ background: GRADIENT }}
                  >
                    {i + 1}
                  </span>
                  <h4 className="font-semibold text-slate-900">{p.title}</h4>
                  <p className="text-sm text-slate-600">{p.blurb}</p>
                  <div className="mt-1 text-xs text-slate-500">
                    <span>{p.when}</span>
                    {p.where ? <> · <span>{p.where}</span></> : null}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {/* TEAM */}
        {detail.team?.length ? (
          <Section id="team" title="Team" icon={<Users className="w-5 h-5 text-slate-500" />}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.team.map((t, i) => (
                <div key={i} className="rounded-2xl border bg-white p-4 text-center shadow-sm">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">No Photo</div>
                    )}
                  </div>
                  <div className="mt-3 font-medium text-slate-900">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.role}</div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* TESTIMONIES */}
        {detail.testimonies?.length ? (
          <Section id="testimonies" title="Testimonies" icon={<Quote className="w-5 h-5 text-slate-500" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              {detail.testimonies.map((t, i) => (
                <div key={i} className="relative rounded-2xl border bg-white p-5 shadow-sm">
                  <Star className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 drop-shadow" />
                  <p className="text-slate-700">“{t.quote}”</p>
                  <div className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{t.name}</span>
                    {t.meta ? <span className="text-slate-500"> • {t.meta}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* FAQ */}
        {detail.faq?.length ? (
          <Section id="faq" title="FAQ">
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.faq.map((f, i) => <FaqItem key={i} {...f} />)}
            </div>
          </Section>
        ) : null}

        {/* CONTACT / CTA */}
        <Section id="contact" title="Get Involved">
          <div className="rounded-2xl border overflow-hidden">
            <div
              className="p-6 md:p-8 text-white"
              style={{ background: GRADIENT }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-white/80 text-xs uppercase tracking-widest">Email</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {detail.contact?.email ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-white/80 text-xs uppercase tracking-widest">Phone</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {detail.contact?.phone ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-white/80 text-xs uppercase tracking-widest">Location</div>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {detail.contact?.location ?? "—"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 md:p-6 bg-white">
              {detail.contact?.cta ? (
                <a
                  href={detail.contact.cta.href}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                  style={{ background: GRADIENT }}
                >
                  {detail.contact.cta.label}
                </a>
              ) : (
                <p className="text-sm text-slate-600">Email or call us to get started.</p>
              )}
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
