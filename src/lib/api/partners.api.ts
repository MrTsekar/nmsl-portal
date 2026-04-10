import { apiClient } from "@/lib/api/client";
import type { Partner } from "@/types";

export const partnersApi = {
  list: async (): Promise<Partner[]> => {
    const { data } = await apiClient.get("/partners");
    return Array.isArray(data) ? data : [];
  },

  listAll: async (): Promise<Partner[]> => {
    const { data } = await apiClient.get("/admin/partners");
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: Omit<Partner, "id" | "createdAt" | "updatedAt">): Promise<Partner> => {
    const { data } = await apiClient.post("/admin/partners", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Omit<Partner, "id" | "createdAt" | "updatedAt">>): Promise<Partner> => {
    const { data } = await apiClient.patch(`/admin/partners/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/admin/partners/${id}`);
    return data;
  },

  toggleActive: async (id: string): Promise<Partner> => {
    const { data } = await apiClient.patch(`/admin/partners/${id}/toggle`);
    return data;
  },
};
