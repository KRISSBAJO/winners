import apiClient from "../../../../lib/apiClient";
export type DemoRequest = {
  _id: string;
  fullName: string; email: string; phone?: string; church?: string; role?: string;
  size?: string; interests: string[]; goals?: string; timeframe?: string; budget?: string;
  demoPref?: string; notes?: string; consent: boolean;
  status: "new" | "in_review" | "scheduled" | "won" | "lost";
  ownerId?: string; adminNotes?: string; source: string; meta: any;
  createdAt: string; updatedAt: string;
};

export type CreateDemoInput = Omit<DemoRequest, "_id" | "status" | "ownerId" | "adminNotes" | "meta" | "createdAt" | "updatedAt"> & {
  source?: string;
};
export type UpdateDemoInput = Partial<Pick<DemoRequest, "status" | "ownerId" | "adminNotes">>;

export const demoService = {
  // public
  createPublic: async (payload: CreateDemoInput): Promise<DemoRequest> => {
    const { data } = await apiClient.post("/demo/public", payload);
    return data;
  },

  // private (admin)
  list: async (params?: Record<string, any>): Promise<{ items: DemoRequest[]; total: number; page: number; pageSize: number }> => {
    const { data } = await apiClient.get("/demo", { params });
    return data;
  },
  get: async (id: string): Promise<DemoRequest> => {
    const { data } = await apiClient.get(`/demo/${id}`);
    return data;
  },
  update: async (id: string, payload: UpdateDemoInput): Promise<DemoRequest> => {
    const { data } = await apiClient.put(`/demo/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/demo/${id}`);
  },
};
