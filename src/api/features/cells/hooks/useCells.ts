// src/api/features/cells/hooks/useCells.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cellService } from "../services/cellService";
import type {
  CreateCellInput, UpdateCellInput, CreateMeetingInput, UpdateMeetingInput,
  SubmitReportInput, MeetingsQuery, ReportsQuery, AnalyticsQuery, CellAttendanceReport
} from "../types/cellTypes";

import { meetingsKey, reportsKey, analyticsKey, normalizeScope } from './keys';

/* Cells */
export const useCells = (params?: any) =>
  useQuery({ queryKey: ["cells", params], queryFn: () => cellService.listCells(params) });

export const useCell = (id?: string) =>
  useQuery({ queryKey: ["cell", id], enabled: !!(id && id.trim()), queryFn: () => cellService.getCell(id!) });

export const useCreateCell = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateCellInput) => cellService.createCell(p),
    onSuccess: (created) => {
      toast.success("Cell created");
      qc.invalidateQueries({ queryKey: ["cells"], exact: false });
      qc.setQueryData<any[]>(["cells", {} as any], (prev) =>
        Array.isArray(prev) ? [created, ...prev] : prev
      );
    },
  });
};

export const useUpdateCell = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateCellInput) => cellService.updateCell(id, p),
    onSuccess: (updated) => {
      toast.success("Cell updated");
      qc.invalidateQueries({ queryKey: ["cells"], exact: false });
      qc.invalidateQueries({ queryKey: ["cell", id] });
    },
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
export const useMeetings = (params?: MeetingsQuery) => {
  const scope = normalizeScope(params);
  const enabled = Boolean(scope.cellId || scope.churchId || scope.districtId || scope.nationalChurchId);

  return useQuery({
    queryKey: meetingsKey(params),
    queryFn:  () => cellService.listMeetings(params),
    enabled,
    refetchOnMount: "always",
    select: (res: any) => (Array.isArray(res) ? res : res?.items ?? []),
  });
};

export const useUpdateMeeting = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateMeetingInput) => cellService.updateMeeting(id, p),
    onSuccess: (_d, vars) => {
      toast.success("Meeting updated");
      qc.invalidateQueries({ queryKey: meetingsKey(vars as any) });
    },
  });
};

export const useCreateMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateMeetingInput) => cellService.createMeeting(p),
    onSuccess: (created, vars) => {
      toast.success("Meeting scheduled");
      const key = meetingsKey(vars as any);
      qc.setQueryData<any[]>(key, (prev) => (Array.isArray(prev) ? [created, ...prev] : [created]));
      qc.invalidateQueries({ queryKey: key });
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
/* Reports */
export const useReports = (params?: ReportsQuery) => {
  const scope = normalizeScope(params);
  const enabled = Boolean(scope.cellId || scope.churchId || scope.districtId || scope.nationalChurchId);

  return useQuery({
    queryKey: reportsKey(params),
    queryFn:  () => cellService.listReports(params),
    enabled,
    refetchOnMount: "always",
    select: (res: any) => (Array.isArray(res) ? res : res?.items ?? []),
  });
};

export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: SubmitReportInput) => cellService.submitReport(p),
    onSuccess: (created, vars) => {
      // update reports list optimistically
      const rKey = reportsKey(vars as any);
      qc.setQueryData<any[]>(rKey, (prev) => (Array.isArray(prev) ? [created, ...prev] : [created]));
      qc.invalidateQueries({ queryKey: rKey });

      // invalidate unreported meetings list so the reported meeting disappears from the picker
      const mKeyUnreported = meetingsKey({ ...vars, onlyUnreported: true });
      qc.invalidateQueries({ queryKey: mKeyUnreported });

      // also invalidate the general meetings list for freshness
      const mKeyAll = meetingsKey({ cellId: (vars as any).cellId, churchId: (vars as any).churchId });
      qc.invalidateQueries({ queryKey: mKeyAll });
    },
  });
};

// NEW: Update an existing report
export const useUpdateReport = (id: string, scope: { cellId?: string; churchId?: string }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<CellAttendanceReport>) => cellService.updateReport(id, p),
    onSuccess: (updated) => {
      // Invalidate reports in scope
      const rKey = reportsKey(scope);
      qc.invalidateQueries({ queryKey: rKey });
      // Meetings don't need change here; it's already reported
      toast.success("Report updated");
    },
  });
};

// NEW: Delete a report
export const useDeleteReport = (scope: { cellId?: string; churchId?: string }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cellService.deleteReport(id),
    onSuccess: () => {
      // Invalidate reports in scope
      const rKey = reportsKey(scope);
      qc.invalidateQueries({ queryKey: rKey });
      toast.success("Report deleted");
    },
  });
};

/* Analytics */
export const useCellAnalytics = (params: AnalyticsQuery) =>
  useQuery({
    queryKey: analyticsKey(params),
    queryFn:  () => cellService.analytics(params),
    enabled: Boolean(
      (params?.churchId && params.churchId.trim()) ||
      (params?.districtId && params.districtId.trim()) ||
      (params?.nationalChurchId && params.nationalChurchId.trim())
    ),
  });