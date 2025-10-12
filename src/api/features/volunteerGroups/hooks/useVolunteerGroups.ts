import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { volunteerService } from "../services/volunteerService";
import type { VolunteerGroup, CreateGroupInput, UpdateGroupInput } from "../types/volunteerTypes";
import { toast } from "sonner";

export const useGroupsByChurch = (churchId?: string) =>
  useQuery<VolunteerGroup[]>({
    queryKey: ["groups", "church", churchId],
    enabled: !!churchId,
    queryFn: () => volunteerService.listByChurch(churchId!),
  });

export const useGroup = (id?: string) =>
  useQuery<VolunteerGroup>({ queryKey: ["group", id], enabled: !!id, queryFn: () => volunteerService.get(id!) });

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateGroupInput) => volunteerService.create(p),
    onSuccess: () => {
      toast.success("Group created");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useUpdateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupInput }) =>
      volunteerService.update(id, data),
    onSuccess: (_res, { id }) => {
      toast.success("Group updated");
      qc.invalidateQueries({ queryKey: ["groups"] });
      qc.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => volunteerService.remove(id),
    onSuccess: () => {
      toast.success("Group deleted");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useAddGroupMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      volunteerService.addMember(groupId, memberId),
    onSuccess: () => {
      toast.success("Added to group");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useRemoveGroupMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      volunteerService.removeMember(groupId, memberId),
    onSuccess: () => {
      toast.success("Removed from group");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useAssignLeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, leaderId }: { groupId: string; leaderId: string }) =>
      volunteerService.assignLeader(groupId, leaderId),
    onSuccess: () => {
      toast.success("Leader assigned");
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};
