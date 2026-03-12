import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { Service } from "@/types";

export const servicesApi = {
  list: async (): Promise<Service[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/services");
        return data;
      },
      mock: () => mockHandlers.admin.listServices(),
    });
  },

  create: async (payload: Omit<Service, "id" | "createdAt" | "updatedAt">): Promise<Service> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/services", payload);
        return data;
      },
      mock: () => mockHandlers.admin.createService(payload),
    });
  },

  update: async (id: string, payload: Partial<Omit<Service, "id" | "createdAt" | "updatedAt">>): Promise<Service> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/services/${id}`, payload);
        return data;
      },
      mock: () => mockHandlers.admin.updateService(id, payload),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.delete(`/admin/services/${id}`);
        return data;
      },
      mock: () => mockHandlers.admin.deleteService(id),
    });
  },
};
