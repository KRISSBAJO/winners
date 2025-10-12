import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UpdateProfileInput } from "../services/userService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import type { User } from "../../auth/types/authTypes";
import { toast } from "sonner"; // ✅ For nice success/error feedback

/**
 * useProfile
 * ------------
 * Handles:
 * - Updating user profile info (and avatar)
 * - Syncing Zustand auth store + localStorage
 * - React Query cache invalidation
 * - Toast feedback for success/error
 */
export function useProfile() {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();

  const {
    mutate: updateProfile,
    isPending: isUpdating,
    isError,
    error,
    isSuccess,
  } = useMutation<User, Error, UpdateProfileInput>({
    mutationFn: userService.updateProfile,

    onSuccess: (updatedUser) => {
      // ✅ Sync with Zustand + localStorage
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      setAuth({
        user: updatedUser,
        accessToken: accessToken!,
        refreshToken: refreshToken!,
      });

      // ✅ Refresh cached "me" data
      queryClient.invalidateQueries({ queryKey: ["me"] });

      toast.success("Profile updated successfully 🎉");
    },

    onError: (err) => {
      console.error("❌ Profile update failed:", err.message);
      toast.error(err.message || "Failed to update profile. Please try again.");
    },
  });

  return {
    user,
    updateProfile,
    isUpdating,
    isError,
    error,
    isSuccess,
  };
}
