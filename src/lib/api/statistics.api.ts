import { apiClient } from "@/lib/api/client";
import type { Statistic } from "@/types";

export const statisticsApi = {
  list: async (): Promise<Statistic[]> => {
    try {
      const { data } = await apiClient.get("/admin/statistics");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  updateAll: async (stats: Statistic[]): Promise<Statistic[]> => {
    const { data } = await apiClient.put("/admin/statistics", stats);
    return Array.isArray(data) ? data : stats;
  },
};
