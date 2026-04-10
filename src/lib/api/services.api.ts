import { apiClient } from "@/lib/api/client";
import type { Service } from "@/types";

export const servicesApi = {
  list: async (): Promise<Service[]> => {
    const { data } = await apiClient.get("/admin/services");
    return data;
  },

  create: async (payload: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service> => {
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
};
