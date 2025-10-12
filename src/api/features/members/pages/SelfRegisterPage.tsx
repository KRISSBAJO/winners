// src/pages/members/SelfRegisterPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useVerifySelfReg, useSelfRegisterShort, useSelfRegisterLong } from "../hooks/useSelfRegister";
import { toast } from "sonner";

const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";

export default function SelfRegisterPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const nav = useNavigate();

  const { data, isLoading, isError } = useVerifySelfReg(token);

  if (!token) {
    return <ErrorCard title="Missing token" subtitle="This link is invalid." />;
  }

  if (isLoading) return <CenterCard><Loader /></CenterCard>;
  if (isError || !data) return <ErrorCard title="Invalid or expired link" subtitle="Please request a new invitation." />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border bg-white/90 dark:bg-slate-900/70 border-slate-200/70 dark:border-white/10 shadow-xl p-6 space-y-4"
      >
        <header className="space-y-1">
          <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold shadow"
               style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}>
            DC
          </div>
          <h1 className="text-xl font-semibold mt-2">Member Self-Registration</h1>
          <p className="text-sm text-slate-500">
            You are registering <b>{data.email}</b> for this church.
          </p>
        </header>

        {data.kind === "short" ? (
          <ShortForm token={token} onDone={() => { toast.success("Registered!"); nav("/"); }} />
        ) : (
          <LongForm token={token} onDone={() => { toast.success("Registered!"); nav("/"); }} />
        )}
      </motion.div>
    </div>
  );
}

function ShortForm({ token, onDone }: { token: string; onDone: () => void }) {
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female" | "Other">("");
  const m = useSelfRegisterShort();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await m.mutateAsync({ token, firstName, lastName, phone: phone || undefined, gender: (gender || undefined) as any })
          .then(onDone)
          .catch((e: any) => toast.error(e?.response?.data?.message || e.message));
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <TextField label="First name *" value={firstName} onChange={setFirstName} required />
      <TextField label="Last name *" value={lastName} onChange={setLastName} required />
      <TextField label="Phone" value={phone} onChange={setPhone} />
      <SelectField label="Gender" value={gender} onChange={v => setGender(v as any)} options={["", "Male", "Female", "Other"]} />
      <div className="sm:col-span-2 pt-2">
        <Submit loading={m.isPending}>Submit</Submit>
      </div>
    </form>
  );
}

function LongForm({ token, onDone }: { token: string; onDone: () => void }) {
  const m = useSelfRegisterLong();

  // minimal long form (extend as needed)
  const [form, setForm] = useState({
    firstName: "", lastName: "", middleName: "", phone: "", altPhone: "",
    gender: "", maritalStatus: "", dob: "", weddingAnniversary: "",
    address: { street: "", city: "", state: "", country: "", zip: "" },
    notes: "",
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...form,
          gender: form.gender || undefined,
          maritalStatus: form.maritalStatus || undefined,
          dob: form.dob || undefined,
          weddingAnniversary: form.weddingAnniversary || undefined,
        };
        await m.mutateAsync({ token, payload })
          .then(onDone)
          .catch((e: any) => toast.error(e?.response?.data?.message || e.message));
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <TextField label="First name *" value={form.firstName} onChange={(v) => setForm((s) => ({ ...s, firstName: v }))} required />
      <TextField label="Last name *" value={form.lastName} onChange={(v) => setForm((s) => ({ ...s, lastName: v }))} required />
      <TextField label="Middle name" value={form.middleName} onChange={(v) => setForm((s) => ({ ...s, middleName: v }))} />
      <TextField label="Phone" value={form.phone} onChange={(v) => setForm((s) => ({ ...s, phone: v }))} />
      <TextField label="Alt phone" value={form.altPhone} onChange={(v) => setForm((s) => ({ ...s, altPhone: v }))} />
      <SelectField label="Gender" value={form.gender} onChange={(v) => setForm((s) => ({ ...s, gender: v }))} options={["","Male","Female","Other"]} />
      <SelectField label="Marital status" value={form.maritalStatus} onChange={(v) => setForm((s) => ({ ...s, maritalStatus: v }))} options={["","Single","Married","Divorced","Widowed"]} />
      <TextField label="Date of birth" type="date" value={form.dob} onChange={(v) => setForm((s) => ({ ...s, dob: v }))} />
      <TextField label="Wedding anniversary" type="date" value={form.weddingAnniversary} onChange={(v) => setForm((s) => ({ ...s, weddingAnniversary: v }))} />
      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <TextField label="Street" value={form.address.street} onChange={(v) => setForm((s) => ({ ...s, address: { ...s.address, street: v } }))} />
        <TextField label="City" value={form.address.city} onChange={(v) => setForm((s) => ({ ...s, address: { ...s.address, city: v } }))} />
        <TextField label="State" value={form.address.state} onChange={(v) => setForm((s) => ({ ...s, address: { ...s.address, state: v } }))} />
        <TextField label="Country" value={form.address.country} onChange={(v) => setForm((s) => ({ ...s, address: { ...s.address, country: v } }))} />
        <TextField label="ZIP" value={form.address.zip} onChange={(v) => setForm((s) => ({ ...s, address: { ...s.address, zip: v } }))} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2"
          rows={4}
        />
      </div>
      <div className="sm:col-span-2 pt-2">
        <Submit loading={m.isPending}>Submit</Submit>
      </div>
    </form>
  );
}

/* ---------- UI atoms ---------- */

function TextField({
  label, value, onChange, required, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs mb-1">{label}</label>
      <input
        type={type}
        className="w-full rounded-lg border px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs mb-1">{label}</label>
      <select className="w-full rounded-lg border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </div>
  );
}

function Submit({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={!!loading}
      className="w-full rounded-lg text-white px-4 py-2 text-sm disabled:opacity-60"
      style={{ background: `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})` }}
    >
      {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span> : children}
    </button>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[60vh] grid place-items-center p-6">{children}</div>;
}
function Loader() { return <Loader2 className="w-6 h-6 animate-spin text-slate-500" />; }
function ErrorCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <CenterCard>
      <div className="max-w-md w-full rounded-2xl border p-6 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-600 mb-2" />
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </CenterCard>
  );
}
