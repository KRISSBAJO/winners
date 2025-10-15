import { ArrowRight, Users, MessageSquare, CheckCircle2 } from "lucide-react";

/* ---- Brand ---- */
const BRAND_RED  = "#8B0000";
const BRAND_GOLD = "#D4AF37";

/**
 * Premium, classy CTA cards section
 * - Elegant header (eyebrow + headline + subline)
 * - Three gradient-border “glass” cards with medallion icons
 * - Tasteful bottom ribbon CTA
 */
export default function SignatureCtaSuite({
  primaryHref = "/get-started",
  headline = "A Ministry Suite with Care at the Center",
  subline  = "Membership, follow-up, messaging, and visits—beautifully connected so your team can serve with excellence.",
}: {
  primaryHref?: string;
  headline?: string;
  subline?: string;
}) {
  const items = [
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

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="suite-title"
    >
      {/* Soft elegant backdrop (no heavy colors) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80rem 60rem at 10% -20%, rgba(212,175,55,0.10), transparent 55%)," +
            "radial-gradient(80rem 60rem at 110% 0%, rgba(139,0,0,0.08), transparent 50%)," +
            "linear-gradient(180deg, #fff 0%, #fff7ef 22%, #ffffff 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/70 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: BRAND_GOLD }}
              aria-hidden
            />
            Designed for real pastoral work
          </span>

          <h2
            id="suite-title"
            className="mt-4 font-serif text-slate-900"
            style={{ fontSize: "clamp(1.9rem, 4.2vw, 3rem)", lineHeight: 1.15 }}
          >
            {headline}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600 text-[15px] sm:text-base">
            {subline}
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="
                relative rounded-2xl p-[1px]   /* outer gradient border */
                shadow-[0_12px_40px_-20px_rgba(2,19,71,.20)]
                transition-transform hover:-translate-y-0.5
                bg-gradient-to-br
              "
              style={{
                backgroundImage: `linear-gradient(135deg, ${BRAND_GOLD}, rgba(212,175,55,0)),
                                   linear-gradient(0deg, #ffffff, #ffffff)`,
              }}
            >
              <div className="rounded-2xl bg-white p-5">
                {/* Icon medallion */}
                <div className="mb-4 inline-grid place-items-center rounded-full p-[2px] shadow"
                     style={{ background: `conic-gradient(from 220deg, ${BRAND_GOLD}, ${BRAND_RED})` }}
                     aria-hidden>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white">
                    <Icon className="h-5 w-5" style={{ color: BRAND_RED }} />
                  </div>
                </div>

                <h3 className="text-slate-900 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>

                {/* Micro-link */}
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1 text-[13px] font-medium"
                    style={{ color: BRAND_RED }}
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Fine divider */}
        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />

        {/* Ribbon CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:gap-4">
          <div className="text-slate-700 text-sm sm:text-[15px]">
            Ready to streamline ministry and grow healthy follow-up?
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-[1.05] transition"
              style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
            >
              Book a Walkthrough
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>

            <a
              href="/watch-demo"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-300/80 bg-white hover:bg-slate-50 transition"
            >
              Watch Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
