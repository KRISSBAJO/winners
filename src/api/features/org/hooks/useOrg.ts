import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nationalService, districtService, churchService } from "../services/orgService";
import type {
  NationalChurch, District, Church,
  CreateNationalInput, UpdateNationalInput,
  CreateDistrictInput, UpdateDistrictInput,
  CreateChurchInput, UpdateChurchInput
} from "../types/orgTypes";
import { toast } from "sonner";

/* ------------ NationalChurch ------------- */
export const useNationalList = () =>
  useQuery<NationalChurch[]>({ queryKey: ["national"], queryFn: nationalService.list, staleTime: 5 * 60_000 });

export const useNationalOverview = (nationalId?: string) =>
  useQuery({
    queryKey: ["national", "overview", nationalId],
    queryFn: () => nationalService.overview(nationalId!),
    enabled: !!nationalId,
    staleTime: 5 * 60_000,
  });

/** Example: add toasts to creates/updates (optional but recommended) */
export const useCreateNational = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nationalService.create,
    onSuccess: () => {
      toast.success("National church created");
      qc.invalidateQueries({ queryKey: ["national"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Create failed"),
  });
};

export const useUpdateNational = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => nationalService.update(id, payload),
    onSuccess: (_, { id }) => {
      toast.success("National church updated");
      qc.invalidateQueries({ queryKey: ["national"] });
      qc.invalidateQueries({ queryKey: ["national", id] });
      qc.invalidateQueries({ queryKey: ["national", "overview"] }); // refresh cards if showing
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Update failed"),
  });
};

export const useDeleteNational = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nationalService.remove,
    onSuccess: () => {
      toast.success("National church deleted");
      qc.invalidateQueries({ queryKey: ["national"] });
      qc.invalidateQueries({ queryKey: ["national", "overview"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Delete failed"),
  });
};

/* --------------- District ---------------- */
export const useDistrictsByNational = (nationalId?: string) =>
  useQuery<District[]>({
    queryKey: ["districts", { nationalId }],
    queryFn: () => districtService.listByNational(nationalId!),
    enabled: !!nationalId,
    staleTime: 5 * 60_000,
  });

export const useCreateDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateDistrictInput) => districtService.create(p),
    onSuccess: (_d) => {
      qc.invalidateQueries({ queryKey: ["districts"] });
      qc.invalidateQueries({ queryKey: ["districts", { nationalId: _d.nationalChurchId }] });
    },
  });
};

export const useUpdateDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDistrictInput }) => districtService.update(id, payload),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["districts"] });
      qc.invalidateQueries({ queryKey: ["districts", { nationalId: d.nationalChurchId }] });
      qc.invalidateQueries({ queryKey: ["district", d._id] });
    },
  });
};

export const useDeleteDistrict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => districtService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["districts"] }),
  });
};

/* ---------------- Church ----------------- */
export const useChurchesByDistrict = (districtId?: string) =>
  useQuery<Church[]>({
    queryKey: ["churches", { districtId }],
    queryFn: () => churchService.listByDistrict(districtId!),
    enabled: !!districtId,
    staleTime: 5 * 60_000,
  });

export const useCreateChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateChurchInput) => churchService.create(p),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["churches"] });
      qc.invalidateQueries({ queryKey: ["churches", { districtId: c.districtId }] });
    },
  });
};

export const useUpdateChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateChurchInput }) => churchService.update(id, payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["churches"] });
      qc.invalidateQueries({ queryKey: ["churches", { districtId: c.districtId }] });
      qc.invalidateQueries({ queryKey: ["church", c._id] });
    },
  });
};

export const useDeleteChurch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => churchService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["churches"] }),
  });
};
