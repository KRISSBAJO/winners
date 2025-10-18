// src/api/features/delegations/hooks.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/apiClient";
import { toast } from "sonner";

export type Delegation = {
  _id: string;
  grantorId: any;
  granteeId: any;
  scope: { nationalChurchId?: string; districtId?: string; churchId?: string };
  permissions?: string[];
  roleLike?: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
  isRevoked?: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- helpers ---------------- */

function titleCase(s: string) {
  return s.replace(/\./g, " ").replace(/\b(\w)/g, (m) => m.toUpperCase());
}
function formatPermission(p: string) {
  return titleCase(p);
}
function extractApiError(err: any) {
  const data = err?.response?.data ?? {};
  const status = err?.response?.status;
  const code = data?.code as string | undefined;
  const message = (data?.message as string) || err?.message || "Something went wrong";
  const missing = (data?.missing as string[]) || [];
  return { status, code, message, missing };
}
function toastDelegationCreateSuccess(d: any) {
  const scopeBits = [
    d?.scope?.nationalChurchId && `Nat ${String(d.scope.nationalChurchId).slice(-4)}`,
    d?.scope?.districtId && `Dist ${String(d.scope.districtId).slice(-4)}`,
    d?.scope?.churchId && `Ch ${String(d.scope.churchId).slice(-4)}`
  ]
    .filter(Boolean)
    .join("  ·  ");

  const what = d?.roleLike
    ? `role ${d.roleLike}`
    : `${(d?.permissions || []).length} ${(d?.permissions || []).length === 1 ? "permission" : "permissions"}`;

  toast.success("Delegation created", {
    description:
      [
        `Granted ${what} to ${d?.granteeId?.firstName ?? ""} ${d?.granteeId?.lastName ?? ""}`.trim(),
        scopeBits && `Scope: ${scopeBits}`,
        `Active ${new Date(d.startsAt).toLocaleString()} → ${new Date(d.endsAt).toLocaleString()}`
      ]
        .filter(Boolean)
        .join("\n"),
  });
}
function toastDelegationCreateError(err: any) {
  const { code, message, missing } = extractApiError(err);

  if (code === "GRANTOR_INSUFFICIENT" && missing.length) {
    toast.error("You can’t delegate that role", {
      description:
        `${message}.\nMissing: ${missing.map(formatPermission).join(", ")}\n` +
        `Tip: switch to “Custom permissions” and delegate only what you have.`,
    });
    return;
  }
  if (code === "SCOPE_INVALID") {
    toast.error("Invalid scope", { description: message || "Pick a valid national/district/church." });
    return;
  }
  if (code === "TIME_RANGE_INVALID") {
    toast.error("Dates not valid", { description: "End must be after start, and in the future." });
    return;
  }
  if (code === "GRANTEE_REQUIRED") {
    toast.error("Select a user to delegate to.");
    return;
  }
  if (code === "SELF_DELEGATION_FORBIDDEN") {
    toast.error("You can’t delegate to yourself.");
    return;
  }
  toast.error("Could not create delegation", { description: message });
}

/* ---------------- queries (v5-safe: no onError in options) ---------------- */

export const useMyDelegations = (as: "grantor" | "grantee" = "grantor", active?: boolean) => {
  const q = useQuery({
    queryKey: ["delegations", "mine", as, active ? "active" : "all"],
    queryFn: async () =>
      (await api.get<Delegation[]>(`/delegations/mine`, { params: { as, active: active ? 1 : 0 } })).data,
  });

  useEffect(() => {
    if (q.isError) {
      const { message } = extractApiError(q.error);
      toast.error("Couldn’t load your delegations", { description: message });
    }
  }, [q.isError, q.error]);

  return q;
};

export const useDelegationsForMe = () => {
  const q = useQuery({
    queryKey: ["delegations", "for-me"],
    queryFn: async () => (await api.get<Delegation[]>(`/delegations/for-me`)).data,
  });

  useEffect(() => {
    if (q.isError) {
      const { message } = extractApiError(q.error);
      toast.error("Couldn’t load delegated access", { description: message });
    }
  }, [q.isError, q.error]);

  return q;
};

/* ---------------- mutations (v5 still supports callbacks) ---------------- */

export const useCreateDelegation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => (await api.post(`/delegations`, payload)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["delegations"] });
      toastDelegationCreateSuccess(data);
    },
    onError: (err) => {
      toastDelegationCreateError(err);
    },
  });
};

export const useRevokeDelegation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/delegations/${id}/revoke`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delegations"] });
      toast.success("Delegation revoked", { description: "Access has been removed." });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      toast.error("Could not revoke delegation", { description: message });
    },
  });
};
