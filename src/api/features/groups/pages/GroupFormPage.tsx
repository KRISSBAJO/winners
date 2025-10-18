import { useNavigate, useParams } from "react-router-dom";
import { useGroup, useCreateGroup, useUpdateGroup } from "../hooks/useGroups";
import type { GroupCreate } from "../types/groupTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, UploadCloud, Info } from "lucide-react";
import OrgCascader, { ScopeValue } from "../../../../components/OrgCascader";

/* Brand */
const BRAND_RED = "#8B0000";
const BRAND_GOLD = "#D4AF37";
const GRADIENT = `linear-gradient(135deg, ${BRAND_RED}, ${BRAND_GOLD})`;

const MEET_DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const EMPTY: GroupCreate & {
  nationalChurchId?: string;
  districtId?: string;
} = {
  nationalChurchId: undefined,
  districtId: undefined,
  churchId: "",
  type: "cell",
  name: "",
  subtitle: "",
  description: "",
  coverUrl: "",
  tags: [],
  publicArea: "",
  visibility: "members",
  joinPolicy: "request",
  address: "",
  capacity: undefined,
  isActive: true,
  meetDay: "",
  meetTime: "",
};

export default function GroupFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { data } = useGroup(id);
  const create = useCreateGroup();
  const update = useUpdateGroup(id || "");
  const nav = useNavigate();

  const [form, setForm] = useState(EMPTY);

  // cover: local file + preview
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  // hydrate on edit
  useEffect(() => {
    if (data && isEdit) {
      setForm((f) => ({
        ...f,
        nationalChurchId: (data as any).nationalChurchId, // in case you store it
        districtId: (data as any).districtId,
        churchId: data.churchId,
        type: data.type,
        name: data.name,
        subtitle: data.subtitle,
        description: data.description,
        coverUrl: data.coverUrl,
        tags: data.tags ?? [],
        publicArea: data.publicArea,
        visibility: data.visibility ?? "members",
        joinPolicy: data.joinPolicy ?? "request",
        address: data.address,
        meetDay: data.meetDay || "",
        meetTime: data.meetTime || "",
        capacity: data.capacity,
        isActive: data.isActive ?? true,
      }));
      setPreview(data.coverUrl || null);
    }
  }, [data, isEdit]);

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onChooseFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  // org cascader change
  const onScopeChange = (s: ScopeValue) => {
    setForm((f) => ({
      ...f,
      nationalChurchId: s.nationalId,
      districtId: s.districtId,
      churchId: s.churchId || "",
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.churchId) {
      alert("Please select a Church (via National → District → Church).");
      return;
    }

    setUploading(true);
    try {
      if (isEdit) {
        await update.mutateAsync({
          data: {
            ...form,
            // if user removed the image, send empty string to clear on backend
            coverUrl: preview ? form.coverUrl : "",
          },
          file: file || undefined,
          onProgress: setProgress,
        });
      } else {
        await create.mutateAsync({
          data: form,
          file: file || undefined,
          onProgress: setProgress,
        });
      }
      nav("/dashboard/admin/groups");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  // tags
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!(form.tags || []).includes(t)) {
      setForm({ ...form, tags: [...(form.tags || []), t] });
    }
    setTagInput("");
  };
  const removeTag = (t: string) =>
    setForm({ ...form, tags: (form.tags || []).filter((x) => x !== t) });

  const title = useMemo(() => (isEdit ? "Edit Group" : "Create New Group"), [isEdit]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              onClick={() => nav("/dashboard/admin/groups")}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="rounded-lg px-4 py-2 text-white shadow-md hover:brightness-110 disabled:opacity-60"
              style={{ background: GRADIENT }}
              disabled={uploading || create.isPending || update.isPending}
            >
              {isEdit ? "Save changes" : "Create group"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 🔶 Org scope selector (replaces manual Church ID input) */}
        <OrgCascader
          value={{
            nationalId: form.nationalChurchId,
            districtId: form.districtId,
            churchId: form.churchId,
          }}
          onChange={onScopeChange}
          className="mb-2"
        />

        {/* Cover + Identity */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-[360px,1fr]">
            <div className="border-b md:border-b-0 md:border-r p-4">
              <CoverUploader
                preview={preview}
                uploading={uploading || create.isPending || update.isPending}
                progress={progress}
                onFile={(f) => onChooseFile(f)}
                onClear={() => {
                  onChooseFile(null);
                  setForm({ ...form, coverUrl: "" });
                }}
              />
            </div>

            <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Type */}
                <Field label="Type">
                  <select
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  >
                    {["cell","ministry","class","prayer","outreach","youth","women","men","seniors","other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                {/* Capacity */}
                <Field label="Capacity">
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.capacity ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        capacity: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="optional"
                  />
                </Field>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="Name" required>
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Midtown Bible Circle"
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.subtitle || ""}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="optional"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description">
                  <textarea
                    className="w-full rounded-lg border px-3 py-2"
                    rows={4}
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short public description"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Meeting Day">
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.meetDay || ""}
                onChange={(e) => setForm({ ...form, meetDay: e.target.value })}
              >
                <option value="">Select day</option>
                {MEET_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Meeting Time">
                <input
                    type="time"
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.meetTime || ""}
                    onChange={(e) => setForm({ ...form, meetTime: e.target.value })}
                />
            </Field>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Visibility">
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as any })}
              >
                <option value="public">public</option>
                <option value="members">members</option>
                <option value="private">private</option>
              </select>
            </Field>

            <Field label="Join Policy">
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.joinPolicy}
                onChange={(e) => setForm({ ...form, joinPolicy: e.target.value as any })}
              >
                <option value="request">request</option>
                <option value="invite">invite</option>
                <option value="auto">auto</option>
              </select>
            </Field>

            <Field label="Active">
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={String(form.isActive)}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </Field>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Field label="Public Area (city/zone)">
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.publicArea || ""}
                onChange={(e) => setForm({ ...form, publicArea: e.target.value })}
                placeholder="e.g. Eastwood"
              />
            </Field>

            <Field
              label={
                <span className="inline-flex items-center gap-1">
                  Address (private)
                  <Info className="h-4 w-4 text-slate-400" />
                </span>
              }
              hint="Not shown publicly. Visible only to authorized members/admins."
            >
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, etc."
              />
            </Field>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <Field label="Tags">
              <div className="flex flex-wrap items-center gap-2">
                {(form.tags || []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-slate-200"
                      onClick={() => removeTag(t)}
                      aria-label={`Remove tag ${t}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                <TagAdder onAdd={(tag) => setForm({ ...form, tags: [...(form.tags || []), tag] })} />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            onClick={() => nav("/dashboard/admin/groups")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-white shadow-md hover:brightness-110 disabled:opacity-60"
            style={{ background: GRADIENT }}
            disabled={uploading || create.isPending || update.isPending}
          >
            {isEdit ? "Save changes" : "Create group"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </label>
  );
}

function CoverUploader({
  preview,
  uploading,
  progress,
  onFile,
  onClear,
}: {
  preview: string | null;
  uploading: boolean;
  progress: number;
  onFile: (f: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      className="relative h-[220px] w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 transition overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      role="button"
      onClick={() => inputRef.current?.click()}
      aria-label="Upload cover image"
    >
      {!preview ? (
        <div className="absolute inset-0 grid place-items-center text-center px-6">
          <div>
            <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
            <div className="mt-2 text-sm text-slate-600">
              Drag & drop or <span className="font-semibold">browse</span>
            </div>
            <div className="text-xs text-slate-500">JPG/PNG up to ~5MB</div>
          </div>
        </div>
      ) : (
        <>
          <img
            src={preview}
            alt="Cover preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <button
            type="button"
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs shadow hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        </>
      )}

      {(uploading || progress > 0) && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200">
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, background: GRADIENT }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function TagAdder({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal("");
  };
  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded-lg border px-2 py-1 text-sm"
        placeholder="Add tag"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
      />
      <button
        type="button"
        onClick={add}
        className="rounded-md px-3 py-1.5 text-sm text-white"
        style={{ background: GRADIENT }}
      >
        Add
      </button>
    </div>
  );
}
