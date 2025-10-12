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
    if (perm.startsWith("user.")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (perm.startsWith("event.")) return "bg-green-100 text-green-800 border-green-200";
    if (perm.startsWith("comment.")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (perm.startsWith("group.")) return "bg-orange-100 text-orange-800 border-orange-200";
    if (perm.startsWith("role.")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const confirmDelete = (role: Role) => {
    if (window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) {
      onDelete(role);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="divide-x divide-gray-200 dark:divide-gray-700">
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white w-48">Key</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white w-56">Name</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Permissions</th>
              <th className="text-right p-4 font-semibold text-gray-900 dark:text-white w-56">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {roles.map((r, index) => (
              <tr
                key={r._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                onMouseEnter={() => setHoverRow(r._id)}
                onMouseLeave={() => setHoverRow(null)}
              >
                <td className="p-4 font-mono text-gray-900 dark:text-white bg-gradient-to-r from-transparent to-gray-50 dark:to-gray-800">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{r.key}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{r.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5 max-w-full">
                    {r.permissions.length > 0 ? (
                      r.permissions.map((p) => (
                        <span
                          key={p}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            getPermColor(p)
                          } ${hoverRow === r._id ? 'scale-105 shadow-md' : ''}`}
                          title={p}
                        >
                          <span className="truncate max-w-[120px]">{p}</span>
                          {onRemoveOnePerm && (
                            <button
                              className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white rounded-full p-0.5 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveOnePerm(r, p);
                              }}
                              aria-label={`remove ${p}`}
                            >
                              <X size={12} className="text-gray-500" />
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No permissions assigned</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEdit(r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
                      title="Edit role details"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => onReplacePerms(r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all text-indigo-700 dark:text-indigo-300"
                      title="Edit permissions"
                    >
                      <Shield size={14} />
                      Perms
                    </button>
                    <button
                      onClick={() => confirmDelete(r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-all text-red-700 dark:text-red-300"
                      title="Delete role"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {!roles.length && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No roles yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first role to get started.</p>
        </div>
      )}
    </div>
  );
}

// Helper: Color mapper for permissions
const getPermColor = (perm: PermissionKey) => {
  if (perm.startsWith("user.")) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
  if (perm.startsWith("event.")) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
  if (perm.startsWith("comment.")) return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
  if (perm.startsWith("group.")) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
  if (perm.startsWith("role.")) return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800";
  return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
};

