// src/api/hooks/useGroups.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Group, GroupCreate, GroupUpdate, GroupPublic,
  Paginated, ListParams, ObjectId, Occurrence, OccurrenceCreate, OccurrenceUpdate,
  JoinRequest, JoinRequestCreate, NextOccurrenceSummary
} from "../types/groupTypes";
import { useQueries } from "@tanstack/react-query";
import * as svc from "../services/group.service";
import { listNextOccurrencesBulk } from "../services/group.service";
import apiClient from "../../../../lib/apiClient";

export const QK = {
  public: (p?: ListParams) => ["groups", "public", p] as const,
  list:   (p?: ListParams) => ["groups", "list", p] as const,
  one:    (id: ObjectId)  => ["groups", "one", id] as const,
  occ:    (gid: ObjectId) => ["groups", "occ", gid] as const,
  reqs:   (gid: ObjectId) => ["groups", "reqs", gid] as const,
};

/** -------- Public directory -------- */
export function usePublicGroups(params?: ListParams) {
  return useQuery<Paginated<GroupPublic>, Error>({
    queryKey: QK.public(params),
    queryFn: () => svc.listPublicGroups(params),
  });
}

/** -------- Groups (auth) -------- */
export function useGroups(params?: ListParams) {
  return useQuery<Paginated<Group>, Error>({
    queryKey: QK.list(params),
    queryFn: () => svc.listGroups(params),
  });
}

export function useGroup(id?: ObjectId, enabled = true) {
  return useQuery<Group, Error>({
    queryKey: id ? QK.one(id) : ["groups", "one", "null"],
    queryFn: () => svc.getGroup(id as string),
    enabled: !!id && enabled,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { data: GroupCreate; file?: File; onProgress?: (n: number) => void }) =>
      svc.createGroup(args.data, args.file, args.onProgress),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["groups", "list"] });
      qc.setQueryData(QK.one(created._id), created);
    },
  });
}

export function useUpdateGroup(id: ObjectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { data: GroupUpdate; file?: File; onProgress?: (n: number) => void }) =>
      svc.updateGroup(id, args.data, args.file, args.onProgress),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["groups", "list"] });
      qc.setQueryData(QK.one(id), updated);
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: ObjectId) => svc.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", "list"] });
    },
  });
}

/** -------- Occurrences -------- */
export function useOccurrences(groupId?: ObjectId) {
  return useQuery<Occurrence[], Error>({
    queryKey: groupId ? QK.occ(groupId) : ["groups", "occ", "null"],
    queryFn: () => svc.listOccurrences(groupId as string),
    enabled: !!groupId,
  });
}

export function useCreateOccurrence(groupId: ObjectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OccurrenceCreate) => svc.createOccurrence(groupId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.occ(groupId) });
    },
  });
}

export function useUpdateOccurrence(groupId: ObjectId, occurrenceId: ObjectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OccurrenceUpdate) => svc.updateOccurrence(occurrenceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.occ(groupId) });
    },
  });
}

export function useDeleteOccurrence(groupId: ObjectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceId: ObjectId) => svc.deleteOccurrence(occurrenceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.occ(groupId) });
    },
  });
}

/** -------- Join Requests -------- */
export function useSubmitJoinRequest(groupId: ObjectId) {
  return useMutation({
    mutationFn: (payload: JoinRequestCreate) => svc.submitJoinRequest(groupId, payload),
  });
}

export function useListJoinRequests(groupId?: ObjectId) {
  return useQuery<JoinRequest[], Error>({
    queryKey: groupId ? QK.reqs(groupId) : ["groups", "reqs", "null"],
    queryFn: () => svc.listJoinRequests(groupId as string),
    enabled: !!groupId,
  });
}

export function useHandleJoinRequest(groupId: ObjectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { requestId: ObjectId; approve: boolean }) =>
      svc.handleJoinRequest(args.requestId, args.approve),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.reqs(groupId) });
    },
  });
}


export function useNextOccurrences(groupIds: ObjectId[]) {
  const key = ["groups", "next-occ", [...groupIds].sort().join(",")];
  return useQuery<Record<string, NextOccurrenceSummary | null>, Error>({
    queryKey: key,
    enabled: groupIds.length > 0,
    queryFn: () => listNextOccurrencesBulk(groupIds),
    staleTime: 60_000, // 1 min
  });
}

export function useNextOccurrencesPerGroup(ids: ObjectId[]) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["groups","next-occ",id],
      queryFn: async () => (await apiClient.get(`/groups/${id}/occurrences/next`)).data,
      enabled: !!id,
      staleTime: 60_000,
    })),
  });
  const map: Record<string, { startAt: string } | null> = {};
  ids.forEach((id, i) => (map[id] = results[i].data ?? null));
  return { data: map, isLoading: results.some(r => r.isLoading) };
}