// src/api/features/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UpdateProfileInput, CreateUserInput, AdminUpdateInput } from "../services/userService";
import type { User } from "../../auth/types/authTypes";

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserInput) => userService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const adminUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateInput }) =>
      userService.adminUpdate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => userService.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    usersQuery,
    createUser: createMutation.mutateAsync,            // ✅
    updateUserAdmin: adminUpdateMutation.mutateAsync,  // ✅
    toggleActive: toggleActiveMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isLoading:
      usersQuery.isLoading ||
      createMutation.isPending ||
      adminUpdateMutation.isPending ||
      toggleActiveMutation.isPending ||
      deleteMutation.isPending,
  };
}
