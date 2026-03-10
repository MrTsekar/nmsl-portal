import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";

export const appointmentsApi = {
  list: async (status?: string) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/appointments", { params: { status } });
        return data;
      },
      mock: () => mockHandlers.appointments.list(status),
    });
  },
  getById: async (id: string) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/appointments/${id}`);
        return data;
      },
      mock: () => mockHandlers.appointments.get(id),
    });
  },
  reschedule: async (id: string, payload: { date: string; time: string; reason?: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/appointments/${id}/reschedule`, payload);
        return data;
      },
      mock: () => mockHandlers.appointments.reschedule(id, payload),
    });
  },
};
