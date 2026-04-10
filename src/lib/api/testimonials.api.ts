import { apiClient } from "@/lib/api/client";
import type { Testimonial } from "@/types";

export const testimonialsApi = {
  list: async (): Promise<Testimonial[]> => {
    try {
      const { data } = await apiClient.get("/admin/testimonials");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  create: async (payload: Omit<Testimonial, "id" | "createdAt" | "updatedAt">): Promise<Testimonial> => {
    const { data } = await apiClient.post("/admin/testimonials", payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`);
  },
};
