import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleService } from "../services/roleService";
import type { Role, CreateRoleInput, UpdateRoleInput, PermissionKey } from "../types/roleTypes";

/* ========== QUERIES ========== */
export const useRoles = () =>
  useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: roleService.list,
    staleTime: 60_000,
  });

export const useRole = (id?: string) =>
  useQuery<Role>({
    queryKey: ["role", id],
    queryFn: () => roleService.get(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

export const usePermissionKeys = () =>
  useQuery<PermissionKey[]>({
    queryKey: ["permissionKeys"],
    queryFn: roleService.permissionKeys,
    staleTime: 5 * 60_000,
  });

/* ========== MUTATIONS (roles) ========== */
export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleInput) => roleService.create(payload),
    onSuccess: () => {
      toast.success("Role created");
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Create failed"),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoleInput }) => roleService.update(id, payload),
    onSuccess: (role) => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role", role._id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Update failed"),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => {
      toast.success("Role deleted");
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Delete failed"),
  });
};

/* ========== MUTATIONS (permissions) ========== */


export const useReplacePermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { permissions: PermissionKey[] } }) =>
      roleService.replacePermissions(id, body),
    onSuccess: (role) => {
      toast.success("Permissions updated");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role", role._id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Update failed"),
  });
};

export const useAddPermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionKey[] }) =>
      roleService.addPermissions(id, permissions),
    onSuccess: (role) => {
      toast.success("Permissions added");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role", role._id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Add failed"),
  });
};

export const useRemovePermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionKey[] }) =>
      roleService.removePermissions(id, permissions),
    onSuccess: (role) => {
      toast.success("Permissions removed");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role", role._id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Remove failed"),
  });
};

/* ========== MATRIX SYNC ========== */
export const useSyncRoleMatrix = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => roleService.syncMatrix(),
    onSuccess: () => {
      toast.success("Matrix synced");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["permissionKeys"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Sync failed"),
  });
};

/* ========== Permission helper ========== */
export function makeCan(permissions?: PermissionKey[]) {
  const set = new Set(permissions || []);
  return {
    has: (p: PermissionKey) => set.has(p),
    any: (arr: PermissionKey[]) => arr.some((p) => set.has(p)),
    all: (arr: PermissionKey[]) => arr.every((p) => set.has(p)),
  };
}
