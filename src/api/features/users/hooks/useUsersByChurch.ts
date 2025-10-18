// src/api/features/users/hooks/useUsersByChurch.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../../../../lib/apiClient";
import type { User } from "../../auth/types/authTypes";

export type UsersPage = { items: User[]; nextCursor?: string };

export function useUsersByChurch(churchId?: string, q = "", limit = 30) {
  return useInfiniteQuery<UsersPage, Error>({
    queryKey: ["users", "byChurch", churchId, q],
    enabled: !!churchId,
    initialPageParam: undefined, // v5 required
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(`/users/by-church/${churchId}`, {
        params: { q, limit, cursor: (pageParam as string | undefined) ?? undefined },
      });
      return data as UsersPage;
    },
    getNextPageParam: (lastPage: UsersPage) => lastPage.nextCursor,
  });
}
