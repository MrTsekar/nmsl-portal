import { apiClient } from "@/lib/api/client";
import type { ContactInfo } from "@/types";

export const contactApi = {
  get: async (): Promise<ContactInfo> => {
    const { data } = await apiClient.get("/contact");
    return data;
  },

  update: async (payload: Partial<Omit<ContactInfo, "id" | "updatedAt">>): Promise<ContactInfo> => {
    const { data } = await apiClient.patch("/admin/contact", payload);
    return data;
  },
};
