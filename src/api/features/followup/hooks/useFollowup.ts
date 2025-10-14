// src/api/features/followup/hooks/useFollowup.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followupService } from "../services/followupService";
import type { FollowUpCase, Paginated, ContactAttempt } from "../types/followupTypes";
import { toast } from "sonner";

export const useFollowupList = (params?: Record<string, any>) =>
  useQuery<Paginated<FollowUpCase>>({
    queryKey: ["followup", "list", params],
    queryFn: () => followupService.list(params),
  });

export const useFollowupStats = () =>
  useQuery({ queryKey: ["followup", "stats"], queryFn: followupService.stats, staleTime: 60_000 });

export const useFollowup = (id?: string) =>
  useQuery<FollowUpCase>({
    queryKey: ["followup", id],
    enabled: !!id,
    queryFn: () => followupService.get(id!),
  });

/* mutations */
export const useOpenCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followupService.open,
    onSuccess: () => {
      toast.success("Follow-up case created");
      qc.invalidateQueries({ queryKey: ["followup", "list"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useUpdateCase = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Partial<FollowUpCase>) => followupService.update(id, p),
    onSuccess: () => {
      toast.success("Case updated");
      qc.invalidateQueries({ queryKey: ["followup", id] });
      qc.invalidateQueries({ queryKey: ["followup", "list"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useAssignCase = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string | null) => followupService.assign(id, assignedTo),
    onSuccess: () => {
      toast.success("Assignment updated");
      qc.invalidateQueries({ queryKey: ["followup", id] });
      qc.invalidateQueries({ queryKey: ["followup", "list"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useCaseAction = (id: string) => {
  const qc = useQueryClient();
  return {
    pause: useMutation({
      mutationFn: (note?: string) => followupService.pause(id, note),
      onSuccess: () => { toast.success("Case paused"); qc.invalidateQueries({ queryKey: ["followup", id] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
    resume: useMutation({
      mutationFn: () => followupService.resume(id),
      onSuccess: () => { toast.success("Case resumed"); qc.invalidateQueries({ queryKey: ["followup", id] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
    resolve: useMutation({
      mutationFn: (note?: string) => followupService.resolve(id, note),
      onSuccess: () => { toast.success("Case resolved"); qc.invalidateQueries({ queryKey: ["followup", id] }); qc.invalidateQueries({ queryKey: ["followup", "stats"] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
    archive: useMutation({
      mutationFn: () => followupService.archive(id),
      onSuccess: () => { toast.success("Case archived"); qc.invalidateQueries({ queryKey: ["followup", "list"] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
  };
};

export const useConsent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (consent: { email?: boolean; sms?: boolean; call?: boolean }) =>
      followupService.updateConsent(id, consent),
    onSuccess: () => { toast.success("Consent updated"); qc.invalidateQueries({ queryKey: ["followup", id] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};

export const useCadence = (id: string) => {
  const qc = useQueryClient();
  return {
    set: useMutation({
      mutationFn: (cadenceId: string | null) => followupService.setCadence(id, cadenceId),
      onSuccess: () => { toast.success("Cadence updated"); qc.invalidateQueries({ queryKey: ["followup", id] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
    advance: useMutation({
      mutationFn: () => followupService.advanceCadence(id),
      onSuccess: () => { toast.success("Cadence advanced"); qc.invalidateQueries({ queryKey: ["followup", id] }); },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
  };
};

export const useCadenceList = () =>
  useQuery({
    queryKey: ["followup", "cadences"],
    queryFn: async () => {
      const res: { items?: { _id: string; name: string; type?: string; steps?: any[] }[] } = { items: await followupService.cadences.list() };
      // normalize to array
      return Array.isArray(res) ? res : (res.items ?? []);
    },
    staleTime: 60_000,
  });

export const useAttempts = (id: string) =>
  useQuery<ContactAttempt[]>({
    queryKey: ["followup", id, "attempts"],
    enabled: !!id,
    queryFn: () => followupService.attempts.list(id!),
  });

export const useLogAttempt = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      id: string;
      data?: { channel: ContactAttempt["channel"]; outcome: ContactAttempt["outcome"]; content?: string; nextActionOn?: string };
      payload?: { channel: ContactAttempt["channel"]; outcome: ContactAttempt["outcome"]; content?: string; nextActionOn?: string };
    }) => followupService.attempts.log(p.id, p.data ?? p.payload!),
    onSuccess: () => {
      toast.success("Attempt logged");
      qc.invalidateQueries({ queryKey: ["followup", id, "attempts"] });
      qc.invalidateQueries({ queryKey: ["followup", id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });
};


export const useTags = (id: string) => {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: (tag: string) => followupService.addTag(id, tag),
      onSuccess: () => {
        toast.success("Tag added");
        qc.invalidateQueries({ queryKey: ["followup", id] });
        qc.invalidateQueries({ queryKey: ["followup", "list"] });
      },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
    remove: useMutation({
      mutationFn: (tag: string) => followupService.removeTag(id, tag),
      onSuccess: () => {
        toast.success("Tag removed");
        qc.invalidateQueries({ queryKey: ["followup", id] });
        qc.invalidateQueries({ queryKey: ["followup", "list"] });
      },
      onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
    }),
  };
};