// src/api/features/members/hooks/useSelfRegister.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { memberService, type SelfRegKind, type VerifySelfRegResponse } from "../services/memberService";
import { toast } from "sonner";

/** Verify token before showing form */
export const useVerifySelfReg = (token?: string) =>
  useQuery<VerifySelfRegResponse>({
    queryKey: ["selfreg", "verify", token],
    enabled: !!token,
    queryFn: () => memberService.verifySelfReg(token!),
    retry: false,
  });

/** Admin/staff: send invite */
export const useSendSelfRegInvite = () =>
  useMutation({
    mutationFn: ({ email, churchId, kind }: { email: string; churchId: string; kind: SelfRegKind }) =>
      memberService.sendSelfRegInvite(email, churchId, kind),
    onSuccess: (res) => toast.success("Invite sent"),
    onError: (e: any) => toast.error(e?.response?.data?.message || e.message),
  });

/** Public: short form submit */
export const useSelfRegisterShort = () =>
  useMutation({
    mutationFn: (p: { token: string; firstName: string; lastName: string; phone?: string; gender?: "Male"|"Female"|"Other" }) =>
      memberService.selfRegisterShort(p.token, p),
  });

/** Public: long form submit */
export const useSelfRegisterLong = () =>
  useMutation({
    mutationFn: (p: { token: string; payload: Record<string, any> }) =>
      memberService.selfRegisterLong(p.token, p.payload),
  });
