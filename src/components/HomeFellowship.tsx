import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, MapPin, ArrowRight } from "lucide-react";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

/* Demo data (swap with your own) */
const groups = [
  {
    id: 1,
    image:
     "https://www.gainesville.com/gcdn/authoring/2010/07/24/NTGS/ghows-LK-c8045ea3-c2b2-461e-9d82-41ab054ee2ed-658334eb.jpeg?width=660&height=415&fit=crop&format=pjpg&auto=webp",
    title: "Family Fellowship Night",
    blurb:
      "Scripture, sharing, and a warm meal—bring the kids and come as you are.",
    host: "Smith Home",
    location: "Eastwood • 123 Faith St",
    time: "Wednesdays · 7:00 PM",
    members: 14,
    tag: "Family",
  },
  {
    id: 2,
    image:
      "https://img.apmcdn.org/faf15e58a9def0f838e900b290dc9d5dc63b45ba/uncropped/b2773e-20101207-hc1.jpg",
    title: "Youth Bible Circle",
    blurb: "Real talk, real faith. Discussion + worship for ages 13–18.",
    host: "Johnson House",
    location: "Northside • 456 Hope Ave",
    time: "Fridays · 6:30 PM",
    members: 12,
    tag: "Youth",
  },
  {
    id: 3,
    image:
      "https://campuschurch.com/wp-content/uploads/2021/08/Bible-fellowship-groups-1024x683.jpg",
    title: "Women’s Morning Prayer",
    blurb: "A quiet hour of prayer and encouragement for every season.",
    host: "Grace Sisters",
    location: "West End • 789 Peace Rd",
    time: "Tuesdays · 10:00 AM",
    members: 9,
    tag: "Women",
  },
  {
    id: 4,
    image:
      "https://brandonsdesk.com/wp-content/uploads/2015/11/home-bible-study.jpg?w=640",
    title: "Men’s Accountability",
    blurb: "Grow stronger together through scripture and honest check-ins.",
    host: "Brotherhood",
    location: "Midtown • 101 Unity Ln",
    time: "Thursdays · 7:30 PM",
    members: 10,
    tag: "Men",
  },
    {
    id: 5,
    image: "https://www.dispatch.com/gcdn/authoring/2017/05/05/NCOD/ghows-OH-4d4b77d6-449b-2e35-e053-0100007fe439-b6e899fa.jpeg?width=660&height=441&fit=crop&format=pjpg&auto=webp",
    title: "Family Devotion Night",
    blurb: "Whole family devotion time with songs, stories, and fellowship.",
    description: "Whole family devotion time with songs, stories, and fellowship.",
    host: "The Family Circle",
    location: "202 Harmony Drive, Lovetown",
    time: "Saturdays at 5:00 PM",
    members: 20,
    tag: "Family",
  },
  {
    id: 6,
    image: "https://www.mpnnow.com/gcdn/authoring/2008/03/23/NMP2/ghows-NU-1ed28b99-6cf8-49ed-b1f9-8f98d9a52b20-98761a6f.jpeg?width=660&height=439&fit=crop&format=pjpg&auto=webp",
    title: "Senior Saints Gathering",
    blurb: "Fellowship for seniors with wisdom sharing and prayer. Lot of fun!",
    description: "Fellowship for seniors with wisdom sharing and prayer.",
    host: "Elder Wisdom Group",
    location: "303 Grace Boulevard, Peacetown",
    time: "Mondays at 2:00 PM",
    members: 14,
    tag: "Seniors",
  },
];

export default function HomeFellowshipCompact() {
  return (
    <section className="py-12 sm:py-14 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-7 text-center">
          <h2 className="font-serif text-slate-900" style={{ fontSize: "clamp(1.4rem,3.5vw,2.2rem)" }}>
            Home Fellowship Groups
          </h2>
          <p className="mt-1 text-[15px] text-slate-600">
            Find a nearby circle to grow, pray, and belong.
          </p>
        </div>

        {/* Grid */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {groups.map((g) => (
            <motion.li
              key={g.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
              className="group relative rounded-2xl p-[1px] transition-transform hover:-translate-y-0.5"
              style={{
                backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}, rgba(212,175,55,0))`,
                boxShadow: "0 10px 40px -22px rgba(2,19,71,.25)",
              }}
            >
              <article className="rounded-2xl bg-white overflow-hidden">
                {/* Image block (16:10) with subtle overlay + tag */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={g.image}
                    alt={g.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-md"
                      style={{ background: `${BRAND_RED}` }}
                    >
                      {g.tag}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-slate-900 leading-snug">
                      {g.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                      <Users className="h-3.5 w-3.5" />
                      {g.members}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-600">
                    {g.blurb}
                  </p>

                  {/* Meta */}
                  <div className="mt-3 space-y-1.5 text-[12.5px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{g.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{g.time}</span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-800 hover:text-slate-900"
                      aria-label={`View details for ${g.title}`}
                    >
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm hover:brightness-[1.05] transition"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`,
                      }}
                      aria-label={`Join ${g.title}`}
                    >
                      Join Group
                    </button>
                  </div>
                </div>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
