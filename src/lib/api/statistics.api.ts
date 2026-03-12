import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { Statistic } from "@/types";

export const statisticsApi = {
  list: async (): Promise<Statistic[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/statistics");
        return data;
      },
      mock: () => mockHandlers.admin.listStatistics(),
    });
  },

  updateAll: async (stats: Statistic[]): Promise<Statistic[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.put("/admin/statistics", stats);
        return data;
      },
      mock: () => mockHandlers.admin.updateStatistics(stats),
    });
  },
};
