import { apiClient } from "@/lib/api/client";
import type { BoardMember } from "@/types";

export const boardMembersApi = {
  list: async (): Promise<BoardMember[]> => {
    const { data } = await apiClient.get("/board-members");
    return Array.isArray(data) ? data : [];
  },

  listAll: async (): Promise<BoardMember[]> => {
    const { data } = await apiClient.get("/admin/board-members");
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: Omit<BoardMember, "id" | "createdAt" | "updatedAt">): Promise<BoardMember> => {
    const { data } = await apiClient.post("/admin/board-members", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Omit<BoardMember, "id" | "createdAt" | "updatedAt">>): Promise<BoardMember> => {
    const { data } = await apiClient.patch(`/admin/board-members/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete(`/admin/board-members/${id}`);
    return data;
  },

  toggleActive: async (id: string): Promise<BoardMember> => {
    const { data } = await apiClient.patch(`/admin/board-members/${id}/toggle`);
    return data;
  },

  getUploadUrl: async (filename: string, contentType: string) => {
    return await apiClient.get("/admin/board-members/upload-url", {
      params: { filename, contentType },
    });
  },
};
