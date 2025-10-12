export type PermissionKey =
  | "user.create" | "user.read" | "user.update" | "user.delete" | "user.toggleActive"
  | "event.create" | "event.read" | "event.update" | "event.delete"
  | "comment.create" | "comment.read" | "comment.update.own" | "comment.delete.own" | "comment.delete.any"
  | "group.create" | "group.read" | "group.update" | "group.delete"
  | "role.read" | "role.create" | "role.update" | "role.delete";

export type Role = {
  _id: string;
  key: string;           // "siteAdmin", "churchAdmin", etc.
  name: string;          // "Church Admin"
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRoleInput = {
  key: string;
  name: string;
  permissions?: PermissionKey[]; // optional when creating
};

export type UpdateRoleInput = {
  name?: string;
  permissions?: PermissionKey[];
};
