// src/api/features/attendance/hooks/useAttendanceAdmin.ts
import { useQuery } from "@tanstack/react-query";
import { attendanceAdminService, AdminParams, AdminSummaryResponse, DailyPoint, LeaderboardItem } from "../services/attendanceAdminService";

export const useAdminAttendanceSummary = (params: AdminParams) =>
  useQuery<AdminSummaryResponse>({
    queryKey: ["attendance","admin","summary", params],
    queryFn: () => attendanceAdminService.summary(params),
    enabled: !!(params.nationalId || params.districtId || params.churchId), // avoid blank org queries
    staleTime: 60_000,
  });

export const useAdminAttendanceTimeseries = (params: AdminParams) =>
  useQuery<DailyPoint[]>({
    queryKey: ["attendance","admin","timeseries", params],
    queryFn: () => attendanceAdminService.timeseries(params),
    enabled: !!(params.nationalId || params.districtId || params.churchId),
    staleTime: 60_000,
  });

export const useAdminAttendanceLeaderboard = (params: AdminParams) =>
  useQuery<LeaderboardItem[]>({
    queryKey: ["attendance","admin","leaderboard", params],
    queryFn: () => attendanceAdminService.leaderboard(params),
    enabled: !!(params.nationalId || params.districtId),
    staleTime: 60_000,
  });
