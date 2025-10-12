import apiClient from "../../../../lib/apiClient";
import {
  NationalChurch, District, Church,
  CreateNationalInput, UpdateNationalInput,
  CreateDistrictInput, UpdateDistrictInput,
  CreateChurchInput, UpdateChurchInput, NationalOverview
} from "../types/orgTypes";


/** NationalChurch */
export const nationalService = {
  list: async (): Promise<NationalChurch[]> => {
    const { data } = await apiClient.get("/national");
    return data;
  },
  get: async (id: string): Promise<NationalChurch> => {
    const { data } = await apiClient.get(`/national/${id}`);
    return data;
  },
  create: async (payload: CreateNationalInput): Promise<NationalChurch> => {
    const { data } = await apiClient.post("/national", payload);
    return data;
  },
  update: async (id: string, payload: UpdateNationalInput): Promise<NationalChurch> => {
    const { data } = await apiClient.put(`/national/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/national/${id}`);
  },
   /** Overview: districts (with embedded churches) + totals */
  overview: async (nationalId: string): Promise<{
    info: {
    _id: string;
    name: string;
    code: string;
    nationalPastor?: string;
    address?: any;
  };
  totals: { districts: number; churches: number; pastors: number };
  districts: Array<{
    _id: string;
    name: string;
    code: string;
    districtPastor?: string;
    address?: any;
    churchCount: number;
    churches: Array<{
      _id: string;
      name: string;
      churchId: string;
      pastor?: string;
      contactEmail?: string;
      contactPhone?: string;
      address?: any;
      districtId: string;
    }>;
  }>;
  }> => {
    const { data } = await apiClient.get(`/national/${nationalId}/overview`);
    return data;
  },

  // (Optional) If you prefer the new endpoints instead of the existing ones:
  districts: async (nationalId: string) => {
    const { data } = await apiClient.get(`/national/${nationalId}/districts`);
    return data;
  },
  churches: async (nationalId: string) => {
    const { data } = await apiClient.get(`/national/${nationalId}/churches`);
    return data;
  },
};

/** District */
export const districtService = {
  list: async (): Promise<District[]> => {
    const { data } = await apiClient.get("/districts");
    return data;
  },
  get: async (id: string): Promise<District> => {
    const { data } = await apiClient.get(`/districts/${id}`);
    return data;
  },
  listByNational: async (nationalChurchId: string): Promise<District[]> => {
    const { data } = await apiClient.get(`/districts/national/${nationalChurchId}`);
    return data;
  },
  create: async (payload: CreateDistrictInput): Promise<District> => {
    const { data } = await apiClient.post("/districts", payload);
    return data;
  },
  update: async (id: string, payload: UpdateDistrictInput): Promise<District> => {
    const { data } = await apiClient.put(`/districts/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/districts/${id}`);
  },
};

/** Church */
export const churchService = {
  list: async (): Promise<Church[]> => {
    const { data } = await apiClient.get("/churches");
    return data;
  },
  get: async (id: string): Promise<Church> => {
    const { data } = await apiClient.get(`/churches/${id}`);
    return data;
  },
  listByDistrict: async (districtId: string): Promise<Church[]> => {
    const { data } = await apiClient.get(`/churches/district/${districtId}`);
    return data;
  },
  listByNational: async (nationalChurchId: string): Promise<Church[]> => {
    const { data } = await apiClient.get(`/churches/national/${nationalChurchId}`);
    return data;
  },
  create: async (payload: CreateChurchInput): Promise<Church> => {
    const { data } = await apiClient.post("/churches", payload);
    return data;
  },
  update: async (id: string, payload: UpdateChurchInput): Promise<Church> => {
    const { data } = await apiClient.put(`/churches/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/churches/${id}`);
  },
 
};
