import { apiClient } from "@/lib/api/client";

export const usersApi = {
  list: async () => {
    const { data } = await apiClient.get("/users");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
};
