// src/api/features/role/components/RoleForm.tsx
import type { Role } from "../types/roleTypes";
import { useState } from "react";
import { Key, User, X } from "lucide-react";

export default function RoleForm({
  mode,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Role;
  submitting?: boolean;
  onSubmit: (payload: { key?: string; name: string }) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(initial?.key || "");
  const [name, setName] = useState(initial?.name || "");
  const [keyError, setKeyError] = useState("");
  const [nameError, setNameError] = useState("");

  const validate = () => {
    let valid = true;
    setKeyError("");
    setNameError("");

    if (mode === "create" && !key.trim()) {
      setKeyError("Key is required");
      valid = false;
    }
    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    }
    if (mode === "create" && key.trim() && !/^[a-zA-Z0-9_-]+$/.test(key)) {
      setKeyError("Key must be alphanumeric with underscores/dashes only");
      valid = false;
    }
    return valid;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (mode === "create") onSubmit({ key: key.trim(), name: name.trim() });
    else onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Role" : "Edit Role"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === "create" ? "Define the role’s unique key and display name." : "Update the role’s display name."}
          </p>
        </div>
      </div>

      {/* Key Field (Create Only) */}
      {mode === "create" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Key className="w-4 h-4 text-gray-500" />
            Role Key
          </label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g., churchAdmin"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-10 ${
              keyError 
                ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            }`}
          />
          {keyError && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <X className="w-3 h-3" />
              {keyError}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">Unique backend identifier (alphanumeric, underscores, dashes only).</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4 text-gray-500" />
          Display Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Church Administrator"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-10 ${
            nameError 
              ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          }`}
          required
        />
        {nameError && (
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <X className="w-3 h-3" />
            {nameError}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim() || (mode === "create" && !key.trim())}
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium hover:from-red-700 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {submitting ? "Saving..." : mode === "create" ? "Create Role" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}