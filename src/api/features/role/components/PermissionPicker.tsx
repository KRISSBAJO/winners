// src/api/features/role/components/PermissionPicker.tsx
import { useMemo, useState, useCallback } from "react";
import type { PermissionKey } from "../types/roleTypes";

export default function PermissionPicker({
  all,
  value,
  onChange,
  disabled,
}: {
  all: PermissionKey[] | undefined;    // can be undefined while loading
  value: PermissionKey[];
  onChange: (v: PermissionKey[]) => void;
  disabled?: boolean;
}) {
  const [q, setQ] = useState("");

  const allList = Array.isArray(all) ? all : [];
  const sel = useMemo(() => new Set(value || []), [value]);
  const isAllSelected = allList.length > 0 && allList.every(k => sel.has(k));

  const filtered = useMemo(() => {
    const base = q ? allList.filter(k => k.toLowerCase().includes(q.toLowerCase())) : allList;
    return base.slice().sort();
  }, [allList, q]);

  const toggle = useCallback((k: PermissionKey) => {
    if (sel.has(k)) onChange(value.filter(v => v !== k));
    else onChange([...value, k]);
  }, [sel, value, onChange]);

  const selectAll = useCallback(() => onChange([...new Set([...value, ...allList])]), [value, allList, onChange]);
  const deselectAll = useCallback(() => onChange([]), [onChange]);

  if (disabled) {
    return (
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500">
        <div className="text-sm font-medium">Permissions (disabled)</div>
        <div className="text-xs opacity-60">{value.length} selected</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search permission…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 text-sm transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</div>
      </div>

      {/* Select All / Clear */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={isAllSelected ? deselectAll : selectAll}
          className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition"
        >
          {isAllSelected ? "Deselect All" : "Select All"}
        </button>
        <button
          type="button"
          onClick={deselectAll}
          disabled={value.length === 0}
          className="px-4 py-2.5 border rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Clear ({value.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-72 overflow-y-auto border rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <div className="text-sm font-medium">No permissions found</div>
            <div className="text-xs opacity-60">Try a different search</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((k) => {
              const checked = sel.has(k);
              return (
                <label
                  key={k}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(k)}
                    className="accent-blue-600"
                  />
                  <span className={`text-sm truncate ${checked ? "font-medium text-blue-600" : ""}`}>
                    {k}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{value.length} selected</span>
        {value.length > 0 && (
          <button onClick={deselectAll} className="text-blue-600 hover:text-blue-800 font-medium">
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
