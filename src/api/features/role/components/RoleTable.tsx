import type { Role, PermissionKey } from "../types/roleTypes";
import { X, Edit, Trash2, Key, User, Shield } from "lucide-react";
import { useState } from "react";

export default function RoleTable({
  roles,
  onEdit,
  onDelete,
  onReplacePerms,
  onRemoveOnePerm, // NEW: remove a single permission quickly
}: {
  roles: Role[];
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
  onReplacePerms: (r: Role) => void;
  onRemoveOnePerm?: (role: Role, perm: PermissionKey) => void;
}) {
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  const getPermColor = (perm: PermissionKey) => {
    if (perm.startsWith("user.")) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    if (perm.startsWith("event.")) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    if (perm.startsWith("comment.")) return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
    if (perm.startsWith("group.")) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
    if (perm.startsWith("role.")) return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800";
    return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
  };

  const confirmDelete = (role: Role) => {
    if (window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) {
      onDelete(role);
    }
  };

  return (
    <div className="space-y-4">
      {roles.map((r) => (
        <div
          key={r._id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 space-y-4 hover:shadow-lg transition-all duration-200"
          onMouseEnter={() => setHoverRow(r._id)}
          onMouseLeave={() => setHoverRow(null)}
        >
          {/* Header: Key and Name */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="font-semibold text-lg truncate">{r.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Key className="w-4 h-4" />
                <span className="font-mono truncate">{r.key}</span>
              </div>
            </div>
            
            {/* Actions (visible on hover) */}
            <div className={`flex gap-2 transition-opacity duration-200 ${hoverRow === r._id ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={() => onEdit(r)}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                title="Edit role details"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onReplacePerms(r)}
                className="p-2 rounded-lg border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 transition"
                title="Edit permissions"
              >
                <Shield size={16} />
              </button>
              <button
                onClick={() => confirmDelete(r)}
                className="p-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition"
                title="Delete role"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              Permissions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.permissions.length > 0 ? (
                r.permissions.map((p) => (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${getPermColor(p)}`}
                    title={p}
                  >
                    <span className="truncate max-w-[150px]">{p}</span>
                    {onRemoveOnePerm && (
                      <button
                        className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full p-0.5 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveOnePerm(r, p);
                        }}
                        aria-label={`remove ${p}`}
                      >
                        <X size={12} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">No permissions assigned</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}