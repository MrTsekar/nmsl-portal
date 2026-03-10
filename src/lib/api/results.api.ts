import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";

export const resultsApi = {
  list: async () => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/results");
        return data;
      },
      mock: () => mockHandlers.results.list(),
    });
  },
  getById: async (id: string) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/results/${id}`);
        return data;
      },
      mock: () => mockHandlers.results.get(id),
    });
  },
};
