// src/api/features/cells/hooks/useCells.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cellService } from "../services/cellService";
import type {
  CreateCellInput, UpdateCellInput, CreateMeetingInput, UpdateMeetingInput, SubmitReportInput
} from "../types/cellTypes";

/* Cells */
export const useCells = (params?: any) =>
  useQuery({ queryKey: ["cells", params], queryFn: () => cellService.listCells(params) });

export const useCell = (id?: string) =>
  useQuery({ queryKey: ["cell", id], enabled: !!id, queryFn: () => cellService.getCell(id!) });

export const useCreateCell = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateCellInput) => cellService.createCell(p),
    onSuccess: () => { toast.success("Cell created"); qc.invalidateQueries({ queryKey: ["cells"] }); }
  });
};

export const useUpdateCell = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateCellInput) => cellService.updateCell(id, p),
    onSuccess: () => {
      toast.success("Cell updated");
      qc.invalidateQueries({ queryKey: ["cells"] });
      qc.invalidateQueries({ queryKey: ["cell", id] });
    }
  });
};

export const useDeleteCell = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cellService.deleteCell(id),
    onSuccess: () => { toast.success("Cell deleted"); qc.invalidateQueries({ queryKey: ["cells"] }); }
  });
};

export const useAddMembersToCell = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberIds: string[]) => cellService.addMembers(id, memberIds),
    onSuccess: () => { toast.success("Members added"); qc.invalidateQueries({ queryKey: ["cell", id] }); }
  });
};

export const useRemoveMemberFromCell = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => cellService.removeMember(id, memberId),
    onSuccess: () => { toast.success("Member removed"); qc.invalidateQueries({ queryKey: ["cell", id] }); }
  });
};

/* Meetings */
export const useMeetings = (params?: { cellId?: string }) =>
  useQuery({
    queryKey: ["cell-meetings", params?.cellId ?? null],
    queryFn: () => cellService.listMeetings(params),
    enabled: !!params?.cellId,
    select: (res: any) => (Array.isArray(res) ? res : res?.items ?? []), // <- always-array
    refetchOnMount: "always", // <- prevents “empty on first open” surprises
  });

export const useCreateMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateMeetingInput) => cellService.createMeeting(p),
    onSuccess: (created, vars) => {
      toast.success("Meeting scheduled");
      const key = ["cell-meetings", vars.cellId ?? null, vars.churchId ?? null] as const;
      qc.invalidateQueries({ queryKey: key });
      qc.setQueryData<any[]>(key, (prev) => (Array.isArray(prev) ? [created, ...prev] : [created]));
    },
  });
};

export const useUpdateMeeting = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateMeetingInput) => cellService.updateMeeting(id, p),
    onSuccess: (_d, vars) => {
      toast.success("Meeting updated");
      qc.invalidateQueries({
        queryKey: ["cell-meetings", (vars as any)?.cellId ?? null, (vars as any)?.churchId ?? null],
      });
    },
  });
};

export const useDeleteMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cellService.deleteMeeting(id),
    onSuccess: () => {
      toast.success("Meeting deleted");
      qc.invalidateQueries({ queryKey: ["cell-meetings"] });
    },
  });
};

/* Reports & Analytics */
export const useReports = (params?: { cellId?: string; [k: string]: any }) =>
  useQuery({
    queryKey: ["cell-reports", params?.cellId ?? null],
    queryFn: () => cellService.listReports(params),
    enabled: !!params?.cellId,
    select: (res: any) => (Array.isArray(res) ? res : res?.items ?? []),
    refetchOnMount: "always",
  });

export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: SubmitReportInput) => cellService.submitReport(p),
    onSuccess: (created, vars) => {
      const key = ["cell-reports", (vars as any)?.cellId ?? null] as const;
      qc.setQueryData<any[]>(key, (prev) => (Array.isArray(prev) ? [created, ...prev] : [created]));
      qc.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCellAnalytics = (params: { churchId?: string; from?: string; to?: string }) =>
  useQuery({
    queryKey: ["cell-analytics", params?.churchId ?? null, params?.from ?? null, params?.to ?? null],
    queryFn: () => cellService.analytics(params),
  });
