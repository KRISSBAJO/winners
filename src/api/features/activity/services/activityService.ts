import apiClient from "../../../../lib/apiClient";
import type { ActivityListParams, ActivityListResponse } from "../types/activityTypes";

export const activityService = {
  list: async (params: ActivityListParams = {}): Promise<ActivityListResponse> => {
    const { data } = await apiClient.get("/activity", { params });
    // server already returns { items, total, page, pages }
    return data as ActivityListResponse;
  },
};
