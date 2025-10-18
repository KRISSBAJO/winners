// src/api/features/groups/services/group.service.ts
import apiClient from "../../../../lib/apiClient";
import type {
  Group, GroupCreate, GroupUpdate, Paginated, GroupPublic,
  Occurrence, OccurrenceCreate, OccurrenceUpdate,
  JoinRequest, JoinRequestCreate, ListParams, ObjectId, NextOccurrenceSummary
} from "../types/groupTypes";

type ProgressCb = (pct: number) => void;

function buildFormData(
  data: Partial<GroupCreate | GroupUpdate>,
  file?: File
) {
  const fd = new FormData();

  // simple scalars
  if (data.churchId) fd.append("churchId", String(data.churchId));
  if (data.type) fd.append("type", String(data.type));
  if (data.name) fd.append("name", data.name);
  if (data.subtitle != null) fd.append("subtitle", data.subtitle);
  if (data.description != null) fd.append("description", data.description);
  if (data.publicArea != null) fd.append("publicArea", data.publicArea);
  if (data.visibility) fd.append("visibility", String(data.visibility));
  if (data.joinPolicy) fd.append("joinPolicy", String(data.joinPolicy));
  if (data.address != null) fd.append("address", data.address);
  if (data.capacity != null) fd.append("capacity", String(data.capacity));
  if (data.isActive != null) fd.append("isActive", String(data.isActive));

  // tags as repeated field
  (data.tags ?? []).forEach((t) => fd.append("tags[]", t));

  // allow explicit clear on update
  if (data.coverUrl === "") fd.append("coverUrl", "");

  // attach file for multer
  if (file) fd.append("coverUrl", file);

  return fd;
}

const qs = (params?: Record<string, any>) =>
  params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as any)}`)
        .join("&")
    : "";

/* -------- Public directory (no auth) -------- */
export async function listPublicGroups(params?: ListParams): Promise<Paginated<GroupPublic>> {
  const { data } = await apiClient.get(`/groups/public${qs(params)}`);
  return data;
}

/* -------- Authenticated: Groups -------- */
export async function listGroups(params?: ListParams): Promise<Paginated<Group>> {
  const { data } = await apiClient.get(`/groups${qs(params)}`);
  return data;
}

export async function getGroup(id: ObjectId): Promise<Group> {
  const { data } = await apiClient.get(`/groups/${id}`);
  return data;
}

export async function createGroup(
  payload: GroupCreate,
  file?: File,
  onProgress?: ProgressCb
): Promise<Group> {
  const form = buildFormData(payload, file);
  const { data } = await apiClient.post(`/groups`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
}

export async function updateGroup(
  id: ObjectId,
  payload: GroupUpdate,
  file?: File,
  onProgress?: ProgressCb
): Promise<Group> {
  const form = buildFormData(payload, file);
  const { data } = await apiClient.put(`/groups/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
}

export async function deleteGroup(id: ObjectId): Promise<{ ok: true }> {
  const { data } = await apiClient.delete(`/groups/${id}`);
  return data;
}

/* -------- Occurrences (meetings) -------- */
export async function listOccurrences(groupId: ObjectId): Promise<Occurrence[]> {
  const { data } = await apiClient.get(`/groups/${groupId}/occurrences`);
  return data;
}

export async function createOccurrence(groupId: ObjectId, payload: OccurrenceCreate): Promise<Occurrence> {
  const { data } = await apiClient.post(`/groups/${groupId}/occurrences`, payload);
  return data;
}

export async function updateOccurrence(occurrenceId: ObjectId, payload: OccurrenceUpdate): Promise<Occurrence> {
  const { data } = await apiClient.put(`/groups/occurrences/${occurrenceId}`, payload);
  return data;
}

export async function deleteOccurrence(occurrenceId: ObjectId): Promise<{ ok: true }> {
  const { data } = await apiClient.delete(`/groups/occurrences/${occurrenceId}`);
  return data;
}

/* -------- Join Requests -------- */
// public can submit
export async function submitJoinRequest(groupId: ObjectId, payload: JoinRequestCreate): Promise<JoinRequest> {
  const { data } = await apiClient.post(`/groups/${groupId}/requests`, payload);
  return data;
}

// auth read/handle
export async function listJoinRequests(groupId: ObjectId): Promise<JoinRequest[]> {
  const { data } = await apiClient.get(`/groups/${groupId}/requests`);
  return data;
}

export async function handleJoinRequest(requestId: ObjectId, approve: boolean): Promise<JoinRequest> {
  if (approve) {
    // matches /requests/:requestId/handle expecting { action: "approve" }
    const { data } = await apiClient.post(`/groups/requests/${requestId}/handle`, { action: "approve" });
    return data;
  } else {
    // explicit reject route, no body
    const { data } = await apiClient.post(`/groups/requests/${requestId}/reject`);
    return data;
  }
}

export async function listNextOccurrencesBulk(
  ids: ObjectId[]
): Promise<Record<string, NextOccurrenceSummary | null>> {
  if (!ids.length) return {};
  // POST /groups/occurrences/next { ids: [...] }
  const { data } = await apiClient.post(`/groups/occurrences/next`, { ids });
  // Expecting shape: { [groupId]: { groupId, startAt, rrule?, locationOverride? } | null }
  return data;
}