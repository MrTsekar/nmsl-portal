import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { Partner } from "@/types";

export const partnersApi = {
  list: async (): Promise<Partner[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/partners");
        return data;
      },
      mock: () => mockHandlers.partners.list(),
    });
  },

  listAll: async (): Promise<Partner[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/partners");
        return data;
      },
      mock: () => mockHandlers.partners.listAll(),
    });
  },

  create: async (payload: Omit<Partner, "id" | "createdAt" | "updatedAt">): Promise<Partner> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/partners", payload);
        return data;
      },
      mock: () => mockHandlers.partners.create(payload),
    });
  },

  update: async (id: string, payload: Partial<Omit<Partner, "id" | "createdAt" | "updatedAt">>): Promise<Partner> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/partners/${id}`, payload);
        return data;
      },
      mock: () => mockHandlers.partners.update(id, payload),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.delete(`/admin/partners/${id}`);
        return data;
      },
      mock: () => mockHandlers.partners.delete(id),
    });
  },

  toggleActive: async (id: string): Promise<Partner> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/partners/${id}/toggle`);
        return data;
      },
      mock: () => mockHandlers.partners.toggleActive(id),
    });
  },
};
