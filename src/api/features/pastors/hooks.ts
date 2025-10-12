// src/api/features/pastors/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listPastors,
  getPastor,
  createPastor,
  updatePastor,
  deletePastor,
  listAssignments,
  createAssignment,
  endAssignment,
} from "./service";
import type {
  Pastor,
  PastorCreateInput,
  PastorUpdateInput,
  PastorListParams,
  Paginated,
  PastorAssignment,
  PastorAssignInput,
  EndAssignmentInput,
} from "./types";

/* ---------- Query keys ---------- */
const qk = {
  list: (params: Partial<PastorListParams> = {}) => ["pastors", "list", params] as const,
  detail: (id: string) => ["pastors", "detail", id] as const,
  assignments: (id: string) => ["pastors", "assignments", id] as const,
};

/* ---------- List ---------- */
export const usePastors = (params: PastorListParams = {}) =>
  useQuery<Paginated<Pastor>>({
    queryKey: qk.list(params),
    queryFn: () => listPastors(params),
    staleTime: 30_000,
    // keepPreviousData: true,
  });

/* ---------- Detail ---------- */
export const usePastor = (id?: string) =>
  useQuery<Pastor>({
    queryKey: qk.detail(id || "nil"),
    queryFn: () => {
      if (!id) throw new Error("Missing id");
      return getPastor(id);
    },
    enabled: !!id,
    staleTime: 30_000,
  });

/* ---------- Create ---------- */
export const useCreatePastor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PastorCreateInput) => createPastor(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastors", "list"] });
    },
  });
};

/* ---------- Update ---------- */
export const useUpdatePastor = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: PastorUpdateInput) => updatePastor(id, patch),
    onSuccess: (data) => {
      qc.setQueryData(qk.detail(id), data);
      qc.invalidateQueries({ queryKey: ["pastors", "list"] });
    },
  });
};

/* ---------- Delete ---------- */
export const useDeletePastor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePastor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastors", "list"] });
    },
  });
};

/* ---------- Assignments (list/create/end) ---------- */
export const usePastorAssignments = (pastorId?: string) =>
  useQuery<PastorAssignment[]>({
    queryKey: qk.assignments(pastorId || "nil"),
    queryFn: () => {
      if (!pastorId) throw new Error("Missing pastorId");
      return listAssignments(pastorId);
    },
    enabled: !!pastorId,
    staleTime: 30_000,
  });

export const useCreateAssignment = (pastorId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PastorAssignInput) => createAssignment(pastorId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.assignments(pastorId) });
      qc.invalidateQueries({ queryKey: qk.detail(pastorId) }); // if backend updates snapshot
    },
  });
};

export const useEndAssignment = (pastorId: string, assignmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EndAssignmentInput = {}) =>
      endAssignment(pastorId, assignmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.assignments(pastorId) });
      qc.invalidateQueries({ queryKey: qk.detail(pastorId) });
    },
  });
};
