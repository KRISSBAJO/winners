import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, User, Check, Calendar, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BRAND_PRIMARY = "#021347"; // deep blue
const BRAND_ACCENT  = "#8B0000"; // deep red
const BRAND_GOLD    = "#D4AF37";

type Payload = {
  fullName: string; email: string; phone?: string; church?: string; role?: string;
  size?: string; interests: string[]; goals?: string; timeframe?: string; budget?: string;
  demoPref?: string; notes?: string; consent: boolean;
};

export default function GetStartedForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<Payload>({
    fullName: "", email: "", phone: "", church: "", role: "", size: "",
    interests: [], goals: "", timeframe: "", budget: "", demoPref: "Live Demo",
    notes: "", consent: false,
  });

  const interestOptions = [
    "Membership","Follow-up","Messaging (SMS/Email)","Tasks & Reminders",
    "Visits & Care Notes","Analytics/Dashboards","Giving/Integrations","Data Import/Migration",
  ];
  const sizes = ["< 100","100–249","250–499","500–999","1,000+"];
  const timeframes = ["ASAP","0–30 days","30–60 days","This quarter"];
  const budgets = ["Exploring","< $99/mo","$99–$299/mo","$300–$999/mo","$1k+/mo"];

  function update<K extends keyof Payload>(key: K, value: Payload[K]) {
    setData((d) => ({ ...d, [key]: value })); setErrors((e) => ({ ...e, [key as string]: "" }));
  }
  function toggleInterest(value: string) {
    setData((d) => d.interests.includes(value)
      ? { ...d, interests: d.interests.filter(i => i !== value) }
      : { ...d, interests: [...d.interests, value] });
  }
  function validate() {
    const e: Record<string,string> = {};
    if (!data.fullName.trim()) e.fullName = "Name is required.";
    if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Valid email is required.";
    if (!data.consent) e.consent = "Please accept to be contacted.";
    setErrors(e); return Object.keys(e).length === 0;
  }
  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault(); if (!validate()) return;
    setSubmitting(true);
    try { await new Promise((r) => setTimeout(r, 900)); setDone(true); }
    catch { setErrors((e) => ({ ...e, form: "Something went wrong. Please try again." })); }
    finally { setSubmitting(false); }
  }

  if (done) {
    return (
      <section id="get-started" className="relative min-h-screen grid place-items-center overflow-hidden">
        <Backdrop />
        <div className="mx-auto max-w-3xl w-full px-6">
          <div className="rounded-[28px] border border-black/10 bg-white/85 backdrop-blur-xl p-10 shadow-2xl text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full"
                 style={{ background: `linear-gradient(135deg, ${BRAND_GOLD}, ${BRAND_ACCENT})` }}>
              <Check className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-serif text-3xl text-slate-900">Thank you! 🎉</h2>
            <p className="mt-2 text-slate-600">
              We’ve received your inquiry. A specialist will reach out shortly with next steps and a personalized demo.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="get-started" className="relative min-h-screen overflow-hidden">
      <Backdrop />

      {/* Header */}
      <div className="sticky top-0 z-10 mx-auto max-w-6xl px-6 pt-8 pb-3">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-xs sm:text-sm font-medium rounded-full px-2 py-1 ring-1 ring-white/30">Back</span>
            </Link>
            <div className="text-center">
              <h1 className="font-serif text-white text-xl sm:text-3xl leading-tight drop-shadow">
                Get Started — Inquiry
              </h1>
              <p className="text-white/85 text-xs sm:text-sm">
                Tell us about your church and goals. We’ll tailor a walkthrough for your team.
              </p>
            </div>
            <div className="w-[84px] sm:w-[120px]" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-[32px] border border-white/18 bg-white/80 backdrop-blur-2xl shadow-[0_40px_140px_-40px_rgba(2,19,71,.5)] px-6 py-7 sm:px-10 sm:py-10"
        >
          {/* subtle divider line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/40 to-transparent mb-6" />

          <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left */}
            <div className="lg:col-span-7 space-y-5">
              <Field label="Full Name" required icon={<User className="h-4 w-4" />} error={errors.fullName}>
                <input className="input" type="text" value={data.fullName}
                       onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" autoComplete="name" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Email" required icon={<Mail className="h-4 w-4" />} error={errors.email}>
                  <input className="input" type="email" value={data.email}
                         onChange={(e) => update("email", e.target.value)} placeholder="you@church.org" autoComplete="email" />
                </Field>
                <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                  <input className="input" type="tel" value={data.phone}
                         onChange={(e) => update("phone", e.target.value)} placeholder="(555) 555-1234" autoComplete="tel" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Church / Organization" icon={<Building2 className="h-4 w-4" />}>
                  <input className="input" type="text" value={data.church}
                         onChange={(e) => update("church", e.target.value)} placeholder="Grace Chapel" autoComplete="organization" />
                </Field>
                <Field label="Your Role / Title">
                  <input className="input" type="text" value={data.role}
                         onChange={(e) => update("role", e.target.value)} placeholder="Pastor, Admin, etc." />
                </Field>
              </div>

              <Field label="Primary Goals">
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={data.goals}
                  onChange={(e) => update("goals", e.target.value)}
                  placeholder="What would you like to accomplish? (e.g., follow-up automation, consolidate tools, analytics)"
                />
              </Field>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 space-y-5">
              <Field label="Congregation Size">
                <Select value={data.size} onChange={(v) => update("size", v)} options={sizes} />
              </Field>

              <Field label="Timeframe" icon={<Calendar className="h-4 w-4" />}>
                <Select value={data.timeframe} onChange={(v) => update("timeframe", v)} options={timeframes} />
              </Field>

              <Field label="Budget Range">
                <Select value={data.budget} onChange={(v) => update("budget", v)} options={budgets} />
              </Field>

              <Field label="Preferred Demo Type" icon={<MessageSquare className="h-4 w-4" />}>
                <Select value={data.demoPref} onChange={(v) => update("demoPref", v)}
                        options={["Live Demo","Recorded Walkthrough","Quick Call"]} />
              </Field>

              <Field label="Interested In">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {interestOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition
                        ${data.interests.includes(opt)
                          ? "border-transparent text-white shadow-md"
                          : "border-slate-300/60 text-slate-700 hover:shadow-sm"}`}
                      style={{
                        background: data.interests.includes(opt)
                          ? `linear-gradient(135deg, ${BRAND_PRIMARY}, ${BRAND_GOLD})`
                          : "linear-gradient(180deg,#fff,#fbfbfb)",
                      }}
                    >
                      <input type="checkbox" className="sr-only"
                             checked={data.interests.includes(opt)} onChange={() => toggleInterest(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Notes (optional)">
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={data.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Anything else we should know?"
                />
              </Field>
            </div>

            {/* Consent + submit */}
            <div className="lg:col-span-12 mt-1">
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#021347]"
                       checked={data.consent} onChange={(e) => update("consent", e.target.checked)} />
                <span>I agree to be contacted about Dominion Connect and understand my data will be handled according to your privacy policy.</span>
              </label>
              {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
            </div>

            {errors.form && (
              <div className="lg:col-span-12">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            <div className="lg:col-span-12 mt-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                type="submit" disabled={submitting}
                className="group relative inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold uppercase
                           text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#021347]/70
                           transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${BRAND_PRIMARY}, ${BRAND_GOLD})` }}
              >
                <span className="relative z-10">{submitting ? "Sending..." : "Request Demo"}</span>
                {!submitting && (
                  <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/25 blur-[2px] transition-transform duration-700 group-hover:translate-x-[260%]" />
                  </span>
                )}
              </button>

              <a
                href="mailto:hello@yourchurchapp.com"
                className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold uppercase
                           text-[#021347] ring-2 ring-[#021347]/30 hover:ring-[#021347]/60 bg-white/95 backdrop-blur transition"
              >
                Email Us
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Backdrop + helpers ---------------- */

function Backdrop() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* deep vertical brand gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            rgba(2,19,71,.92) 0%,
            rgba(2,19,71,.78) 20%,
            rgba(2,19,71,.58) 48%,
            rgba(2,19,71,.38) 100%)`,
        }}
      />
      {/* soft color blobs (use inline style so colors render correctly) */}
      <div
        className="absolute -top-24 -left-20 h-[26rem] w-[26rem] rounded-full opacity-25 blur-3xl"
        style={{ background: BRAND_GOLD }}
      />
      <div
        className="absolute -bottom-28 -right-16 h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl"
        style={{ background: BRAND_ACCENT }}
      />
      {/* faint grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function Field({
  label, required, icon, error, children,
}: { label: string; required?: boolean; icon?: React.ReactNode; error?: string; children: React.ReactNode; }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon && <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-700">{icon}</span>}
        <span>{label}{required && <span className="text-red-500"> *</span>}</span>
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options }:{
  value?: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="relative">
      <select
        className="input appearance-none pr-9"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Choose…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
    </div>
  );
}
