import { apiClient } from "@/lib/api/client";
import type { Statistic } from "@/types";

export const statisticsApi = {
  list: async (): Promise<Statistic[]> => {
    const { data } = await apiClient.get("/admin/statistics");
    return Array.isArray(data) ? data : [];
  },

  updateAll: async (stats: Statistic[]): Promise<Statistic[]> => {
    const { data } = await apiClient.put("/admin/statistics", stats);
    return data;
  },
};
