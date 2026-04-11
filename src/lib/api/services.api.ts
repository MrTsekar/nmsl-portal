import { apiClient } from "@/lib/api/client";
import type { Service, ServiceCategory } from "@/types";

type CreateServicePayload = {
  name: string;
  category: ServiceCategory;
  location: string;
  shortDescription: string;
  fullDescription: string;
  bannerImageUrl?: string;
  iconImageUrl?: string;
  keyServices: Array<{
    title: string;
    description: string;
  }>;
};

export const servicesApi = {
  list: async (): Promise<Service[]> => {
    const { data } = await apiClient.get("/admin/services");
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateServicePayload): Promise<Service> => {
    const { data } = await apiClient.post("/admin/services", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>): Promise<Service> => {
    const { data } = await apiClient.patch(`/admin/services/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/admin/services/${id}`);
    return data;
  },

  getUploadUrl: async (filename: string, contentType: string, type: 'banner' | 'icon') => {
    return await apiClient.get("/admin/services/upload-url", {
      params: { filename, contentType, type },
    });
  },
};
