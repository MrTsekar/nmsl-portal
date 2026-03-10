import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";

export const adminApi = {
  getKpis: async () => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/kpis");
        return data;
      },
      mock: () => mockHandlers.admin.kpis(),
    });
  },
  createDoctor: async (payload: {
    name: string;
    email: string;
    password: string;
    location: string;
    state: string;
    address: string;
    phone: string;
    qualifications: string;
    specialty: string;
  }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/doctors", payload);
        return data;
      },
      mock: () => mockHandlers.admin.createDoctor(payload),
    });
  },
};
