import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demoService, CreateDemoInput, UpdateDemoInput } from "../services/demoService";
import { toast } from "sonner";

export const useCreatePublicDemo = () =>
  useMutation({
    mutationFn: (p: CreateDemoInput) => demoService.createPublic(p),
  });

export const useDemoList = (params?: any) =>
  useQuery({
    queryKey: ["demo", "list", params],
    queryFn: () => demoService.list(params),
    select: (res) => res ?? { items: [], total: 0, page: 1, pageSize: 20 },
  });

export const useDemo = (id?: string) =>
  useQuery({
    queryKey: ["demo", id],
    enabled: !!(id && id.trim()),
    queryFn: () => demoService.get(id!),
  });

export const useUpdateDemo = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateDemoInput) => demoService.update(id, p),
    onSuccess: () => {
      toast.success("Demo request updated");
      qc.invalidateQueries({ queryKey: ["demo"] });
    },
  });
};

export const useDeleteDemo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demoService.remove(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["demo"] });
    },
  });
};
