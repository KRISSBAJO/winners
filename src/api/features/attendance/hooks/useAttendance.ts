import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../services/attendanceService";
import type {
  Attendance,
  AttendanceCreate,
  AttendanceListResponse,
  AttendanceUpsertPayload,
  SummaryResponse,
  DailyPoint,
  WeeklyPoint,
} from "../types/attendanceTypes";
import { toast } from "sonner";

/* List */
export const useAttendance = (params: Partial<Record<string, any>>) =>
  useQuery<AttendanceListResponse>({
    queryKey: ["attendance", params],
    queryFn: () => attendanceService.list(params),
    // keepPreviousData: true,
    staleTime: 30_000,
  });

/* Summary */
export const useAttendanceSummary = (params: { churchId?: string; from?: string; to?: string }) =>
  useQuery<SummaryResponse>({
    queryKey: ["attendance", "summary", params],
    queryFn: () => attendanceService.summary(params as any),
    enabled: !!params.churchId,
    staleTime: 30_000,
  });

/* Daily chart */
export const useAttendanceDaily = (params: { churchId?: string; from?: string; to?: string; serviceType?: string }) =>
  useQuery<DailyPoint[]>({
    queryKey: ["attendance", "daily", params],
    queryFn: () => attendanceService.timeseriesDaily(params as any),
    enabled: !!params.churchId,
    staleTime: 30_000,
  });

/* Weekly chart */
export const useAttendanceWeekly = (params: { churchId?: string; from?: string; to?: string }) =>
  useQuery<WeeklyPoint[]>({
    queryKey: ["attendance", "weekly", params],
    queryFn: () => attendanceService.weekly(params as any),
    enabled: !!params.churchId,
    staleTime: 30_000,
  });

/* Create */
export const useCreateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttendanceCreate) => attendanceService.create(payload),
    onSuccess: () => {
      toast.success("Attendance saved");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance", "summary"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Save failed"),
  });
};

/* Upsert (by day/type) */
export const useUpsertAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttendanceUpsertPayload) => attendanceService.upsert(payload),
    onSuccess: () => {
      toast.success("Attendance updated");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance", "summary"] });
      qc.invalidateQueries({ queryKey: ["attendance", "daily"] });
      qc.invalidateQueries({ queryKey: ["attendance", "weekly"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Upsert failed"),
  });
};

/* Update by id */
export const useUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AttendanceCreate> }) =>
      attendanceService.update(id, payload),
    onSuccess: () => {
      toast.success("Attendance updated");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Update failed"),
  });
};

/* Delete */
export const useDeleteAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.remove(id),
    onSuccess: () => {
      toast.success("Attendance deleted");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance", "summary"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message || "Delete failed"),
  });
};
