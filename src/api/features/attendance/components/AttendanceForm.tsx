import { useEffect, useMemo, useState } from "react";
import type { AttendanceUpsertPayload, ServiceType } from "../types/attendanceTypes";
import { useNationalList, useDistrictsByNational, useChurchesByDistrict } from "../../org/hooks/useOrg";
import { motion } from "framer-motion";

const TYPES: ServiceType[] = ["Sunday","Midweek","PrayerMeeting","Vigil","Conference","Special","Other"];

export default function AttendanceForm({
  initial,
  onSubmit,
  submitting,
  defaultChurchId,
  canChangeChurch = false,
  useOrgCascader = false,
}: {
  initial: Partial<AttendanceUpsertPayload>;
  onSubmit: (v: AttendanceUpsertPayload) => void;
  submitting?: boolean;
  defaultChurchId?: string;
  canChangeChurch?: boolean;
  useOrgCascader?: boolean;
}) {
  const [values, setValues] = useState<Partial<AttendanceUpsertPayload>>({
    serviceType: "Sunday",
    churchId: initial.churchId ?? defaultChurchId ?? "",
    ...initial,
  });

  useEffect(() => {
    setValues((p) => ({ ...p, churchId: p.churchId || defaultChurchId || "" }));
  }, [defaultChurchId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const churchId = values.churchId || defaultChurchId || "";
    if (!churchId) return alert("Select a church");
    if (!values.serviceDate) return alert("Pick a date");
    if (!values.serviceType) return alert("Pick a service type");
    onSubmit({ ...(values as AttendanceUpsertPayload), churchId });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-6">
        {/* Church */}
        {canChangeChurch ? (
          useOrgCascader ? (
            <OrgCascaderInline
              valueChurchId={values.churchId || ""}
              onPick={(cid) => setValues((p) => ({ ...p, churchId: cid }))}
            />
          ) : (
            <Text
              label="Church ID"
              value={values.churchId || ""}
              onChange={(v) => setValues((p) => ({ ...p, churchId: v }))}
              required
            />
          )
        ) : (
          <>
            <input type="hidden" value={values.churchId || defaultChurchId || ""} />
            <ReadOnly label="Church ID" value={values.churchId || defaultChurchId || "—"} />
          </>
        )}

        <Text
          label="Service Date"
          type="date"
          value={(values.serviceDate as string) || ""}
          onChange={(v) => setValues((p) => ({ ...p, serviceDate: v }))}
          required
        />
        <Select
          label="Service Type"
          value={(values.serviceType as string) || "Sunday"}
          onChange={(v) => setValues((p) => ({ ...p, serviceType: v as ServiceType }))}
          options={TYPES}
        />
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <Number label="Men" value={(values as any).men ?? 0} onChange={(n) => setValues((p) => ({ ...p, men: n }))} />
        <Number label="Women" value={(values as any).women ?? 0} onChange={(n) => setValues((p) => ({ ...p, women: n }))} />
        <Number label="Children" value={(values as any).children ?? 0} onChange={(n) => setValues((p) => ({ ...p, children: n }))} />
        <Number label="Online" value={(values as any).online ?? 0} onChange={(n) => setValues((p) => ({ ...p, online: n }))} />
        <Number label="Ushers" value={(values as any).ushers ?? 0} onChange={(n) => setValues((p) => ({ ...p, ushers: n }))} />
        <Number label="Choir" value={(values as any).choir ?? 0} onChange={(n) => setValues((p) => ({ ...p, choir: n }))} />
        <Number label="First Timers" value={(values as any).firstTimers ?? 0} onChange={(n) => setValues((p) => ({ ...p, firstTimers: n }))} />
        <Number label="New Converts" value={(values as any).newConverts ?? 0} onChange={(n) => setValues((p) => ({ ...p, newConverts: n }))} />
        <Number label="Holy Ghost Baptisms" value={(values as any).holyGhostBaptisms ?? 0} onChange={(n) => setValues((p) => ({ ...p, holyGhostBaptisms: n }))} />
      </div>

      <div className="flex justify-end pt-4">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          className="px-8 py-3 rounded-3xl text-white shadow-lg disabled:opacity-70 transition-all"
          style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
        >
          {submitting ? "Saving..." : "Save Attendance"}
        </motion.button>
      </div>
    </form>
  );
}

/* ---------- Cascader ---------- */
function OrgCascaderInline({
  valueChurchId,
  onPick,
}: {
  valueChurchId: string;
  onPick: (churchId: string) => void;
}) {
  const { data: nationals = [] } = useNationalList();
  const [nationalId, setNationalId] = useState("");
  const { data: districts = [] } = useDistrictsByNational(nationalId || undefined);
  const [districtId, setDistrictId] = useState("");
  const { data: churches = [] } = useChurchesByDistrict(districtId || undefined);

  const selectedName = useMemo(() => {
    const f = (churches || []).find((c: any) => c._id === valueChurchId);
    return f?.name;
  }, [churches, valueChurchId]);

  return (
    <div className="grid gap-4">
      <Select label="National" value={nationalId} onChange={(v)=>{ setNationalId(v); setDistrictId(""); onPick(""); }}
        options={["", ...nationals.map((n:any)=>n._id)]}
        renderOptions={() => (
          <>
            <option value="">Select national…</option>
            {nationals.map((n:any)=><option key={n._id} value={n._id}>{n.name}</option>)}
          </>
        )}
      />
      <label className="block">
        <span className="block text-sm font-medium mb-1">District</span>
        <select
          className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={districtId}
          onChange={(e) => { setDistrictId(e.target.value); onPick(""); }}
          disabled={!nationalId}
        >
          <option value="">{nationalId ? "Select district…" : "Select national first"}</option>
          {(districts || []).map((d:any)=><option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1">Church</span>
        <select
          className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
          value={valueChurchId}
          onChange={(e) => onPick(e.target.value)}
          disabled={!districtId}
          required
        >
          <option value="">{districtId ? "Select church…" : "Select district first"}</option>
          {(churches || []).map((c:any)=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {valueChurchId && !selectedName && <div className="text-xs text-slate-500 mt-1">Preset church: {valueChurchId}</div>}
      </label>
    </div>
  );
}

/* ---------- Inputs ---------- */
function Text({ label, value, onChange, type="text", required=false }:{
  label: string; value: string; onChange: (v:string)=>void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type={type}
        required={required}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}

function Number({ label, value, onChange }:{
  label: string; value: number; onChange: (n:number)=>void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        min={0}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={String(value ?? 0)}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options, renderOptions,
}:{
  label: string; value: string; onChange: (v:string)=>void; options?: string[]; renderOptions?: ()=>React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        {renderOptions ? renderOptions() : options?.map(o => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-slate-600">
        {value || "—"}
      </div>
    </label>
  );
}