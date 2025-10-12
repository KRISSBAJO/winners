// src/api/features/pastors/service.ts
import api from "../../../lib/apiClient";
import {
  Pastor,
  PastorCreateInput,
  PastorUpdateInput,
  PastorListParams,
  Paginated,
  PastorAssignment,
  PastorAssignInput,
  EndAssignmentInput,
} from "./types";

/* Keep params clean: drop undefined/null values before sending */
const cleanParams = <T extends Record<string, any>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;

/* ---------- Pastors ---------- */

export async function listPastors(params: PastorListParams = {}) {
  const { data } = await api.get<Paginated<Pastor>>("/pastors", {
    params: cleanParams(params),
  });
  return data;
}

export async function getPastor(id: string) {
  const { data } = await api.get<Pastor>(`/pastors/${id}`);
  return data;
}

export async function createPastor(payload: PastorCreateInput) {
  const { data } = await api.post<Pastor>("/pastors", payload);
  return data;
}

export async function updatePastor(id: string, patch: PastorUpdateInput) {
  const { data } = await api.put<Pastor>(`/pastors/${id}`, patch);
  return data;
}

export async function deletePastor(id: string) {
  const { data } = await api.delete<{ message: string }>(`/pastors/${id}`);
  return data;
}

/* ---------- Assignments ---------- */

export async function listAssignments(pastorId: string) {
  const { data } = await api.get<PastorAssignment[]>(`/pastors/${pastorId}/assignments`);
  return data;
}

export async function createAssignment(pastorId: string, payload: PastorAssignInput) {
  const { data } = await api.post<PastorAssignment>(`/pastors/${pastorId}/assignments`, payload);
  return data;
}

export async function endAssignment(
  pastorId: string,
  assignmentId: string,
  payload: EndAssignmentInput = {}
) {
  const { data } = await api.patch<PastorAssignment>(
    `/pastors/${pastorId}/assignments/${assignmentId}/end`,
    payload
  );
  return data;
}
