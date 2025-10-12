// src/pages/pastors/components/PastorForm.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Pastor,
  PastorCreateInput,
  PastorLevels,
  PastorTitles,
} from "../types";
import OrgCascader from "../../../../components/OrgCascader";
import { toDateInputValue } from "../../../../utils/dateInput";

type Props = {
  initial?: Partial<Pastor>;
  onSubmit: (values: PastorCreateInput) => void | Promise<void>;
  submitting?: boolean;
};

export default function PastorForm({ initial, onSubmit, submitting }: Props) {
  const [values, setValues] = useState<PastorCreateInput>({
    firstName: "",
    lastName: "",
    level: "church",
    currentTitle: "Pastor",
    ...initial,
  } as PastorCreateInput);

  // Normalize nulls from server → undefined for inputs
  useEffect(() => {
    setValues((v) => ({
      ...v,
      ...Object.fromEntries(
        Object.entries(initial || {}).map(([k, val]) => [
          k,
          val === null ? undefined : val,
        ])
      ),
    }));
  }, [initial]);

  const set = (k: keyof PastorCreateInput, v: any) =>
    setValues((s) => ({ ...s, [k]: v }));

  // Keep scope IDs consistent with selected level
  useEffect(() => {
    setValues((s) => {
      if (s.level === "national") {
        return { ...s, districtId: undefined, churchId: undefined };
      }
      if (s.level === "district") {
        return { ...s, churchId: undefined };
      }
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.level]);

  // Build scope value for cascader from current state
  const cascaderValue = useMemo(
    () => ({
      nationalId: values.nationalChurchId || undefined,
      districtId: values.districtId || undefined,
      churchId: values.churchId || undefined,
    }),
    [values.nationalChurchId, values.districtId, values.churchId]
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Minimal validation by level
    if (values.level === "national" && !values.nationalChurchId) {
      alert("Please select a National Church for a national-level pastor.");
      return;
    }
    if (
      values.level === "district" &&
      (!values.nationalChurchId || !values.districtId)
    ) {
      alert(
        "Please select National Church and District for a district-level pastor."
      );
      return;
    }
    if (
      values.level === "church" &&
      (!values.nationalChurchId || !values.districtId || !values.churchId)
    ) {
      alert(
        "Please select National Church, District, and Church for a church-level pastor."
      );
      return;
    }

    onSubmit(values);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs mb-1">First name *</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={values.firstName || ""}
            onChange={(e) => set("firstName", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Middle name</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={values.middleName || ""}
            onChange={(e) => set("middleName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Last name *</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={values.lastName || ""}
            onChange={(e) => set("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1">Gender</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={values.gender || ""}
            onChange={(e) => set("gender", (e.target.value || undefined) as any)}
          >
            <option value="">—</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Phone</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={values.phone || ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2"
            value={values.email || ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Current Title</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={values.currentTitle || "Pastor"}
            onChange={(e) =>
              set("currentTitle", (e.target.value as any) || "Pastor")
            }
          >
            {PastorTitles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs mb-1">DOB</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={toDateInputValue(values.dateOfBirth as any)}
            onChange={(e) => set("dateOfBirth", e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Born Again (date)</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={toDateInputValue(values.dateBornAgain as any)}
            onChange={(e) => set("dateBornAgain", e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Became Pastor (date)</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={toDateInputValue(values.dateBecamePastor as any)}
            onChange={(e) =>
              set("dateBecamePastor", e.target.value || undefined)
            }
          />
        </div>
      </div>

      {/* Level + Org cascader */}
      <div className="grid md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1">Level *</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={values.level}
            onChange={(e) => set("level", e.target.value as any)}
            required
          >
            {PastorLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* OrgCascader controls the three IDs */}
        <div className="md:col-span-3">
          <OrgCascader
            value={cascaderValue}
            onChange={(sc) => {
              set("nationalChurchId", sc.nationalId || undefined);
              set("districtId", sc.districtId || undefined);
              set("churchId", sc.churchId || undefined);
            }}
            compact
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Scope required by level: <strong>national</strong> → National only,{" "}
            <strong>district</strong> → National + District,{" "}
            <strong>church</strong> → National + District + Church.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1">Notes</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          rows={4}
          value={values.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!!submitting}
          className="rounded-lg bg-amber-700 text-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Pastor"}
        </button>
      </div>
    </form>
  );
}
