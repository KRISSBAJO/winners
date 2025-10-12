import { useEffect, useMemo, useState, useRef } from "react";
import type { CreateEventInput, Event, EventType, Visibility } from "../types/eventTypes";
import { useNationalList, useDistrictsByNational, useChurchesByDistrict } from "../../org/hooks/useOrg";

const TYPES: EventType[] = ["Service","BibleStudy","Conference","Outreach","Meeting"];
const VIS: Visibility[] = ["public","private","unlisted"];

type Props = {
  initial: Partial<CreateEventInput>;
  onSubmit: (values: CreateEventInput | Partial<CreateEventInput>) => void;
  submitting?: boolean;
  defaultChurchId?: string;
  canChangeChurch?: boolean;
  useOrgCascader?: boolean;
  existingCoverUrl?: string; // optional: pass current cover when editing
};

export default function EventForm({
  initial,
  onSubmit,
  submitting,
  defaultChurchId,
  canChangeChurch = false,
  useOrgCascader = false,
  existingCoverUrl,
}: Props) {
  const [values, setValues] = useState<Partial<CreateEventInput>>({
    visibility: "public",
    tags: [],
    churchId: initial.churchId ?? defaultChurchId ?? "",
    ...initial,
  });

  // keep churchId synced with defaultChurchId
  useEffect(() => {
    setValues((p) => ({ ...p, churchId: p.churchId || defaultChurchId || "" }));
  }, [defaultChurchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const churchId = values.churchId || defaultChurchId || "";
    if (!churchId) return alert("Please select a Church.");
    onSubmit({ ...values, churchId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Text label="Title" value={values.title || ""} onChange={(v)=>setValues(p=>({...p,title:v}))} required />

        {/* Church selection */}
        {canChangeChurch ? (
          useOrgCascader ? (
            <OrgCascaderInline
              valueChurchId={values.churchId || ""}
              onPick={(cid)=>setValues(p=>({...p, churchId: cid}))}
            />
          ) : (
            <Text
              label="Church ID"
              value={values.churchId || ""}
              onChange={(v)=>setValues(p=>({...p, churchId:v}))}
              required
            />
          )
        ) : (
          <>
            <input type="hidden" value={values.churchId || defaultChurchId || ""} />
            <ReadOnly label="Church" value={values.churchId || defaultChurchId || "—"} />
          </>
        )}

        <Select label="Type" value={values.type || "Service"} onChange={(v)=>setValues(p=>({...p,type:v as Event["type"]}))} options={TYPES} />
        <Select label="Visibility" value={values.visibility || "public"} onChange={(v)=>setValues(p=>({...p,visibility:v as Visibility}))} options={VIS} />
        <Text label="Location" value={values.location || ""} onChange={(v)=>setValues(p=>({...p,location:v}))} />

        <Text label="Start" type="datetime-local" value={values.startDate || ""} onChange={(v)=>setValues(p=>({...p,startDate:v}))} required />
        <Text label="End" type="datetime-local" value={values.endDate || ""} onChange={(v)=>setValues(p=>({...p,endDate:v}))} />
      </div>

      <TextArea
        label="Description"
        rows={4}
        value={values.description || ""}
        onChange={(v)=>setValues(p=>({...p,description:v}))}
      />

      <Text
        label="Tags (comma separated)"
        value={(values.tags || []).join(",")}
        onChange={(v)=>setValues(p=>({...p,tags:v.split(",").map(s=>s.trim()).filter(Boolean)}))}
        placeholder="youth, prayer, men"
      />

      <ImageUploadPreview
        label="Cover Image"
        valueFile={(values as any).cover as File | null}
        valueUrl={existingCoverUrl}
        onChangeFile={(file) => setValues(p => ({ ...p, cover: file || null }))}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg text-white shadow-md disabled:opacity-70 hover:opacity-95 transition"
          style={{ background: "linear-gradient(135deg,#8B0000,#D4AF37)" }}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Image Upload + Preview ---------- */
function ImageUploadPreview({
  label,
  valueFile,
  valueUrl,
  onChangeFile,
  maxMB = 5,
}: {
  label: string;
  valueFile: File | null | undefined;
  valueUrl?: string;
  onChangeFile: (file: File | null) => void;
  maxMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(valueUrl || null);
  const [dragOver, setDragOver] = useState(false);

  // create preview from File
  useEffect(() => {
    if (!valueFile) {
      setPreview(valueUrl || null);
      return;
    }
    const url = URL.createObjectURL(valueFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [valueFile, valueUrl]);

  const pick = () => inputRef.current?.click();

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Image too large. Max ${maxMB}MB.`);
      return;
    }
    onChangeFile(file);
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>

      <div
        className={`relative rounded-xl border border-dashed p-3 transition
          ${dragOver ? "border-amber-500 bg-amber-50/40 dark:bg-amber-500/10" : "border-slate-300/70 dark:border-white/10"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { 
          e.preventDefault(); 
          setDragOver(false); 
          onFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
        onClick={pick}
      >
        {preview ? (
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt="Cover preview"
              className="h-28 w-44 object-cover rounded-lg border border-slate-200/70 dark:border-white/10"
            />
            <div className="flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {valueFile?.name || "Current image"}
              </div>
              <div className="text-xs text-slate-500">Click or drop to replace</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); pick(); }}
                  className="px-3 py-1 rounded-md border hover:bg-slate-50 dark:hover:bg-white/10"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChangeFile(null); }}
                  className="px-3 py-1 rounded-md border bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <div className="text-sm">Drag & drop an image here</div>
            <div className="text-xs">or click to browse (PNG/JPG, up to {maxMB}MB)</div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

/* ---------- Inline Cascader (National → District → Church) ---------- */
function OrgCascaderInline({
  valueChurchId,
  onPick,
}: {
  valueChurchId: string;
  onPick: (churchId: string) => void;
}) {
  const { data: nationals = [] } = useNationalList();
  const [nationalId, setNationalId] = useState<string>("");
  const { data: districts = [] } = useDistrictsByNational(nationalId || undefined);
  const [districtId, setDistrictId] = useState<string>("");
  const { data: churches = [] } = useChurchesByDistrict(districtId || undefined);

  const selectedName = useMemo(() => {
    const found = (churches || []).find((c: any) => c._id === valueChurchId);
    return found?.name;
  }, [churches, valueChurchId]);

  return (
    <div className="grid gap-2">
      <SelectNative
        label="National"
        value={nationalId}
        disabled={false}
        onChange={(v) => { setNationalId(v); setDistrictId(""); onPick(""); }}
        options={[{ label: "Select national…", value: "" }, ...nationals.map((n:any)=>({label:n.name, value:n._id}))]}
      />
      <SelectNative
        label="District"
        value={districtId}
        disabled={!nationalId}
        onChange={(v) => { setDistrictId(v); onPick(""); }}
        options={[
          { label: nationalId ? "Select district…" : "Select national first", value: "" },
          ...(districts||[]).map((d:any)=>({label:d.name, value:d._id})),
        ]}
      />
      <SelectNative
        label="Church"
        value={valueChurchId}
        disabled={!districtId}
        onChange={(v) => onPick(v)}
        options={[
          { label: districtId ? "Select church…" : "Select district first", value: "" },
          ...(churches||[]).map((c:any)=>({label:c.name, value:c._id})),
        ]}
        note={valueChurchId && !selectedName ? `Using preset church: ${valueChurchId}` : ""}
        required
      />
    </div>
  );
}

/* ---------- Small inputs ---------- */
function Text({
  label, value, onChange, type="text", required=false, placeholder
}:{
  label: string; value: string; onChange: (v:string)=>void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label, value, onChange, rows=4, placeholder
}:{
  label: string; value: string; onChange: (v:string)=>void; rows?: number; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options
}:{
  label: string; value: string; onChange: (v:string)=>void; options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SelectNative({
  label, value, onChange, options, disabled, note, required
}:{
  label: string; value: string; onChange: (v:string)=>void;
  options: {label:string; value:string}[]; disabled?: boolean; note?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <select
        className="w-full px-3 py-2 rounded-lg border bg-white/90 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-amber-500/60 disabled:opacity-60"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {note ? <div className="text-xs text-slate-500 mt-1">{note}</div> : null}
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <div className="w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800/40 text-slate-500">
        {value || "—"}
      </div>
    </label>
  );
}
