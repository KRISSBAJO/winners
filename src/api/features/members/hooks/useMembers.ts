import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memberService } from "../services/memberService";
import type { Member, CreateMemberInput, UpdateMemberInput } from "../types/memberTypes";
import { toast } from "sonner";

/* lists */
export const useMembers = (params?: Record<string, any>) =>
  useQuery<Member[]>({ queryKey: ["members", params], queryFn: () => memberService.list(params) });

export const useMembersByChurch = (churchId?: string) =>
  useQuery<Member[]>({
    queryKey: ["members", "church", churchId],
    enabled: !!churchId,
    queryFn: () => memberService.listByChurch(churchId!),
  });

export const useMembersByDistrict = (districtId?: string) =>
  useQuery<Member[]>({
    queryKey: ["members", "district", districtId],
    enabled: !!districtId,
    queryFn: async () => {
      // optional: if backend has /members/district/:id endpoint; if not, compose client-side
      // For now, assume you have it:
      const { data } = await (await import("../../../../lib/apiClient")).default.get(`/members?districtId=${districtId}`);
      return data;
    },
  });

export const useMembersByNational = (nationalId?: string) =>
  useQuery<Member[]>({
    queryKey: ["members", "national", nationalId],
    enabled: !!nationalId,
    queryFn: async () => {
      const { data } = await (await import("../../../../lib/apiClient")).default.get(`/members?nationalId=${nationalId}`);
      return data;
    },
  });

/* one */
export const useMember = (id?: string) =>
  useQuery<Member>({
    queryKey: ["member", id],
    enabled: !!id,
    queryFn: () => memberService.get(id!),
  });

/* stats/quick lists */
export const useMemberStats = () =>
  useQuery({ queryKey: ["members", "stats"], queryFn: memberService.stats, staleTime: 60_000 });

export const useLeaders = () =>
  useQuery<Member[]>({ queryKey: ["members", "leaders"], queryFn: memberService.leaders });

export const useBirthdays = (month?: number) =>
  useQuery<Member[]>({
    queryKey: ["members", "birthdays", month],
    enabled: !!month,
    queryFn: () => memberService.birthdays(month!),
  });

export const useAnniversaries = (month?: number) =>
  useQuery<Member[]>({
    queryKey: ["members", "anniversaries", month],
    enabled: !!month,
    queryFn: () => memberService.anniversaries(month!),
  });

/* mutations */
export const useCreateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateMemberInput) => memberService.create(p),
    onSuccess: () => {
      toast.success("Member created");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useUpdateMember = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateMemberInput) => memberService.update(id, p),
    onSuccess: () => {
      toast.success("Member updated");
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["member", id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memberService.remove(id),
    onSuccess: () => {
      toast.success("Member deleted");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useUploadMembers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, churchId }: { file: File; churchId: string }) => memberService.upload(file, churchId),
    onSuccess: (res) => {
      toast.success(`Uploaded: ${res.successCount}, Failed: ${res.failedCount}`);
      qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useDownloadTemplate = () =>
  useMutation({
    mutationFn: memberService.downloadTemplate,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "members_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });

export const useInviteMember = () =>
  useMutation({
    mutationFn: ({ email, churchId }: { email: string; churchId: string }) =>
      memberService.invite(email, churchId),
    onSuccess: ({ message }) => toast.success(message || "Invite sent"),
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });

export const useRegisterMemberWithToken = () =>
  useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: Partial<Member> }) =>
      memberService.registerWithToken(token, payload),
  });
