import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { ContactInfo } from "@/types";

export const contactApi = {
  get: async (): Promise<ContactInfo> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/contact");
        return data;
      },
      mock: () => mockHandlers.contact.get(),
    });
  },

  update: async (payload: Partial<Omit<ContactInfo, "id" | "updatedAt">>): Promise<ContactInfo> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch("/admin/contact", payload);
        return data;
      },
      mock: () => mockHandlers.contact.update(payload),
    });
  },
};
