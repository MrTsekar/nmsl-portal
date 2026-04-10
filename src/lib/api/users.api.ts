import { apiClient } from "@/lib/api/client";

export const usersApi = {
  list: async () => {
    const { data } = await apiClient.get("/users");
    if (Array.isArray(data)) return data;
    if (data?.users && Array.isArray(data.users)) return data.users;
    return [];
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
};
