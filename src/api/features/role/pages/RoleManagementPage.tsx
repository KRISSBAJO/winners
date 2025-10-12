// src/api/features/role/pages/RoleManagementPage.tsx
import { useMemo, useState } from "react";
import { Plus, RefreshCw, Users2, X } from "lucide-react";
import RoleTable from "../components/RoleTable";
import RoleForm from "../components/RoleForm";
import PermissionPicker from "../components/PermissionPicker";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissionKeys,
  useReplacePermissions,
  useRemovePermissions,
  useSyncRoleMatrix,
} from "../hooks/useRoles";
import type { Role, PermissionKey } from "../types/roleTypes";
import RequirePermission from "../components/RequirePermission";

/* --- small local UI helpers ------------------------------------------------ */
const IconBtn = ({
  children,
  onClick,
  variant = "ghost",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "outline";
  disabled?: boolean;
  className?: string;
}) => {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-95 shadow-md focus:ring-orange-400",
    outline:
      "border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 focus:ring-gray-300",
    ghost:
      "hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
  };
  return (
    <button
      className={`${base} ${variants[variant]} disabled:opacity-60 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default function RoleManagementPage() {
  const { data: roles = [], isLoading } = useRoles();
  const { data: allPerms = [] } = usePermissionKeys();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const replacePerms = useReplacePermissions();
  const removePerms = useRemovePermissions();
  const syncMatrix = useSyncRoleMatrix();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [permEditTarget, setPermEditTarget] = useState<Role | null>(null);
  const [permDraft, setPermDraft] = useState<PermissionKey[]>([]);

  const sortedRoles = useMemo(
    () => roles.slice().sort((a, b) => a.key.localeCompare(b.key)),
    [roles]
  );

  const canSyncMatrix: PermissionKey[] = ["role.update", "role.create"];
  const canCreateRole: PermissionKey[] = ["role.create"];

  const openCreate = () => { setEditTarget(null); setDrawerOpen(true); };
  const openEdit = (r: Role) => { setEditTarget(r); setDrawerOpen(true); };
  const confirmDelete = (r: Role) => { if (confirm(`Delete role "${r.name}"?`)) deleteRole.mutate(r._id); };
  const openPerms = (r: Role) => { setPermEditTarget(r); setPermDraft(r.permissions); };

  const submitCreate = (payload: any) =>
    createRole.mutate(payload, { onSuccess: () => setDrawerOpen(false) });

  const submitEdit = (payload: any) =>
    updateRole.mutate({ id: editTarget!._id, payload }, { onSuccess: () => setDrawerOpen(false) });

  const submitReplacePerms = () => {
    if (!permEditTarget) return;
    replacePerms.mutate(
      { id: permEditTarget._id, body: { permissions: permDraft } },
      { onSuccess: () => setPermEditTarget(null) }
    );
  };

  // quick remove from chip in table
  const removeOne = (role: Role, perm: PermissionKey) => {
    removePerms.mutate({ id: role._id, permissions: [perm] });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden  text-gray-700">
        <div className="px-6 py-2 md:px-8 md:py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                <Users2 className="inline-block w-6 h-6 mr-2 text-amber-700" />
                Roles &amp; Permissions</h1>
              <p className="text-sm text-gray-600 max-w-lg">
                Manage role definitions, assign permissions, and sync from your server matrix.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 self-start">
              <RequirePermission anyOf={canSyncMatrix}>
                <IconBtn
                  onClick={() => syncMatrix.mutate()}
                  variant="outline"
                  disabled={syncMatrix.isPending}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <RefreshCw className={`h-4 w-4 ${syncMatrix.isPending ? "animate-spin" : ""}`} />
                  {syncMatrix.isPending ? "Syncing…" : "Sync Matrix"}
                </IconBtn>
              </RequirePermission>
              <RequirePermission anyOf={canCreateRole}>
                <IconBtn onClick={openCreate} variant="primary">
                  <Plus className="h-4 w-4" />
                  New Role
                </IconBtn>
              </RequirePermission>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : (
          <div className="p-4 md:p-6">
            <RoleTable
              roles={sortedRoles}
              onEdit={openEdit}
              onDelete={confirmDelete}
              onReplacePerms={openPerms}
              onRemoveOnePerm={removeOne}
            />
          </div>
        )}
      </div>

      {/* Drawer / Modal for Create/Edit */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl ml-auto h-full bg-white p-6 md:p-8 overflow-auto shadow-2xl rounded-l-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editTarget ? `Edit Role: ${editTarget.name}` : "Create Role"}
              </h2>
              <IconBtn variant="ghost" onClick={() => setDrawerOpen(false)}>
                <X className="h-4 w-4" /> Close
              </IconBtn>
            </div>

            <RoleForm
              mode={editTarget ? "edit" : "create"}
              initial={editTarget || undefined}
              submitting={createRole.isPending || updateRole.isPending}
              onSubmit={editTarget ? submitEdit : submitCreate}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal for permission replacement */}
      {permEditTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Edit Permissions: <span className="font-mono text-gray-700">{permEditTarget.key}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Replace the entire permission set for this role.
                </p>
              </div>
              <IconBtn variant="ghost" onClick={() => setPermEditTarget(null)}>
                <X className="h-4 w-4" /> Close
              </IconBtn>
            </div>

            <PermissionPicker
              all={allPerms}
              value={permDraft}
              onChange={setPermDraft}
              disabled={replacePerms.isPending}
            />

            <div className="flex justify-end gap-2">
              <IconBtn variant="outline" onClick={() => setPermEditTarget(null)}>Cancel</IconBtn>
              <IconBtn
                variant="primary"
                onClick={submitReplacePerms}
                disabled={replacePerms.isPending}
              >
                {replacePerms.isPending ? "Saving…" : "Save Permissions"}
              </IconBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
