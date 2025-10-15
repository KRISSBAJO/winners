import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, Building2, User, Check, Calendar,
  MessageSquare, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCreatePublicDemo } from "../api/features/demo/hooks/useDemo";

/* ========= Brand ========= */
const BRAND_PRIMARY = "#0B1A3C"; // deeper, calmer blue
const BRAND_PRIMARY_200 = "#D5DBEA";

/* ========= Types ========= */
type Payload = {
  fullName: string; email: string; phone?: string; church?: string; role?: string;
  size?: string; interests: string[]; goals?: string; timeframe?: string; budget?: string;
  demoPref?: string; notes?: string; consent: boolean;
};

/* ========= Component ========= */
export default function GetStartedForm() {

  const createPublic = useCreatePublicDemo(); 

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
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  }
  function toggleInterest(value: string) {
    setData((d) =>
      d.interests.includes(value)
        ? { ...d, interests: d.interests.filter((i) => i !== value) }
        : { ...d, interests: [...d.interests, value] }
    );
  }
  function validate() {
    const e: Record<string, string> = {};
    if (!data.fullName.trim()) e.fullName = "Name is required.";
    if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Valid email is required.";
    if (!data.consent) e.consent = "Please accept to be contacted.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
 async function onSubmit(ev: React.FormEvent) {
  ev.preventDefault();
  if (!validate()) return;
  setSubmitting(true);
  try {
    await createPublic.mutateAsync({
      ...data,
      source: "public_web",
    });
    setDone(true);
  } catch (e: any) {
    setErrors((prev) => ({ ...prev, form: e?.response?.data?.message || "Something went wrong. Please try again." }));
  } finally {
    setSubmitting(false);
  }
}
  /* ========= Success State ========= */
  if (done) {
    return (
      <section id="get-started" className="min-h-screen grid place-items-center bg-slate-50">
        <div className="mx-auto max-w-2xl w-full px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl text-center">
            <div
              className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full"
              style={{ background: BRAND_PRIMARY }}
            >
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Thank you! 🎉
            </h2>
            <p className="mt-2 text-slate-600">
              We’ve received your inquiry. A specialist will reach out shortly with next steps and a personalized demo.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ========= Default Form ========= */
  return (
    <section id="get-started" className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="bg-gradient-to-b from-[#0B1A3C] to-[#0B1A3C]/90"
        style={{ borderBottom: `1px solid ${BRAND_PRIMARY_200}` }}
      >
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
                Get Started — Inquiry
              </h1>
              <p className="mt-2 text-white/80 text-sm">
                Tell us about your church and goals. We’ll tailor a walkthrough for your team.
              </p>
            </div>
            <span className="w-[84px]" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Main Card */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl">
              <div className="px-6 py-6 sm:px-10 sm:py-10">
                <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6">
                  {/* Section: Contact */}
                  <SectionTitle title="Contact details" subtitle="How can we reach you?" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Full Name" required icon={<User className="h-4 w-4" />} error={errors.fullName}>
                      <input
                        className="input"
                        type="text"
                        value={data.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Email" required icon={<Mail className="h-4 w-4" />} error={errors.email}>
                      <input
                        className="input"
                        type="email"
                        value={data.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@church.org"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                      <input
                        className="input"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="(555) 555-1234"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  {/* Section: Organization */}
                  <SectionTitle title="Organization" subtitle="Tell us about your church or ministry." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Church / Organization" icon={<Building2 className="h-4 w-4" />}>
                      <input
                        className="input"
                        type="text"
                        value={data.church}
                        onChange={(e) => update("church", e.target.value)}
                        placeholder="Grace Chapel"
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label="Your Role / Title">
                      <input
                        className="input"
                        type="text"
                        value={data.role}
                        onChange={(e) => update("role", e.target.value)}
                        placeholder="Pastor, Admin, etc."
                      />
                    </Field>
                  </div>

                  {/* Section: Interests */}
                  <SectionTitle title="Interests" subtitle="Pick the areas you care about most." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {interestOptions.map((opt) => {
                      const active = data.interests.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition ${
                            active
                              ? "border-transparent text-white shadow-md"
                              : "border-slate-300/70 text-slate-700 hover:shadow-sm"
                          }`}
                          style={{
                            background: active ? BRAND_PRIMARY : "linear-gradient(180deg,#fff,#fafafa)",
                          }}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={active}
                            onChange={() => toggleInterest(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Section: Goals */}
                  <SectionTitle title="Goals" subtitle="What would you like to accomplish?" />
                  <Field label="Primary Goals">
                    <textarea
                      className="input min-h-[120px] resize-y"
                      value={data.goals}
                      onChange={(e) => update("goals", e.target.value)}
                      placeholder="E.g., follow-up automation, consolidate tools, analytics"
                    />
                  </Field>

                  {/* Consent */}
                  <div className="mt-2">
                    <label className="flex items-start gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[#0B1A3C]"
                        checked={data.consent}
                        onChange={(e) => update("consent", e.target.checked)}
                      />
                      <span>
                        I agree to be contacted about Dominion Connect and understand my data will be handled
                        according to your privacy policy.
                      </span>
                    </label>
                    {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
                  </div>

                  {/* Form error */}
                  {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        background: BRAND_PRIMARY,
                        boxShadow: "0 14px 40px -14px rgba(11,26,60,.45)",
                      }}
                    >
                      <span className="relative z-10">{submitting ? "Sending..." : "Request Demo"}</span>
                      {!submitting && (
                        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/20 blur-[2px] transition-transform duration-700 group-hover:translate-x-[260%]" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Side Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Preferences */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-6">
                <SectionTitleSmall title="Preferences" />
                <div className="grid grid-cols-1 gap-5">
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
                    <Select
                      value={data.demoPref}
                      onChange={(v) => update("demoPref", v)}
                      options={["Live Demo", "Recorded Walkthrough", "Quick Call"]}
                    />
                  </Field>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-6">
                <SectionTitleSmall title="Need something specific?" />
                <p className="text-sm text-slate-600">
                  Prefer to talk first? Reach out and we’ll help you shape the right demo.
                </p>
                <a
                  href="mailto:hello@yourchurchapp.com"
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Email Us
                </a>
              </div>
            </div>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}

/* ========= Subcomponents ========= */

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-1">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}

function SectionTitleSmall({ title }: { title: string }) {
  return <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">{title}</h4>;
}

function Field({
  label, required, icon, error, children,
}: {
  label: string; required?: boolean; icon?: React.ReactNode; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon && (
          <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-700">
            {icon}
          </span>
        )}
        <span>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({
  value, onChange, options,
}: {
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
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
    </div>
  );
}

/* ========= Tailwind “input” utility (inline) =========
   You can keep this here or move to your global CSS as a @layer component.
*/
declare global {
  interface HTMLElementTagNameMap {
    // no-op to satisfy TS when used as className
  }
}

// Use Tailwind’s @apply in a global file if you prefer.
// Here we inline the “input” utility styles via className.
const inputBase =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 " +
  "focus:ring-[#0B1A3C]/10 border-slate-300/70 hover:border-slate-400/70";

const style = document.createElement("style");
style.innerHTML = `
  .input { ${toCss({
    borderRadius: "0.75rem",
  })} }
`;
document.head && !document.head.querySelector("style[data-form-input]") && (() => {
  style.setAttribute("data-form-input", "true");
  document.head.appendChild(style);
})();

/* Tiny helper to inline a couple of custom CSS rules when needed */
function toCss(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}:${v}`)
    .join(";");
}
