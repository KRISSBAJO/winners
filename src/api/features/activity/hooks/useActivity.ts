import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { activityService } from "../services/activityService";
import type { ActivityListParams } from "../types/activityTypes";

/** Simple paged */
export const useActivity = (params: ActivityListParams = { page: 1, limit: 30 }) =>
  useQuery({
    queryKey: ["activity", params.page, params.limit],
    queryFn: () => activityService.list(params),
    // keepPreviousData: true,
  });

/** Infinite scroll (recommended for feed) */
export const useActivityInfinite = (limit = 30) =>
  useInfiniteQuery({
    queryKey: ["activity-infinite", limit],
    queryFn: ({ pageParam = 1 }) => activityService.list({ page: pageParam, limit }),
    getNextPageParam: (last) => {
      const { page, pages } = last;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
