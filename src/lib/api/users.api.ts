import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";

export const usersApi = {
  list: async () => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/users");
        return data;
      },
      mock: () => mockHandlers.users.list(),
    });
  },
  getById: async (id: string) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/users/${id}`);
        return data;
      },
      mock: () => mockHandlers.users.get(id),
    });
  },
};
