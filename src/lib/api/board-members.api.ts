import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { BoardMember } from "@/types";

export const boardMembersApi = {
  list: async (): Promise<BoardMember[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/board-members");
        return data;
      },
      mock: () => mockHandlers.boardMembers.list(),
    });
  },

  listAll: async (): Promise<BoardMember[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/board-members");
        return data;
      },
      mock: () => mockHandlers.boardMembers.listAll(),
    });
  },

  create: async (payload: Omit<BoardMember, "id" | "createdAt" | "updatedAt">): Promise<BoardMember> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/board-members", payload);
        return data;
      },
      mock: () => mockHandlers.boardMembers.create(payload),
    });
  },

  update: async (id: string, payload: Partial<Omit<BoardMember, "id" | "createdAt" | "updatedAt">>): Promise<BoardMember> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/board-members/${id}`, payload);
        return data;
      },
      mock: () => mockHandlers.boardMembers.update(id, payload),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.delete(`/admin/board-members/${id}`);
        return data;
      },
      mock: () => mockHandlers.boardMembers.delete(id),
    });
  },

  toggleActive: async (id: string): Promise<BoardMember> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/board-members/${id}/toggle`);
        return data;
      },
      mock: () => mockHandlers.boardMembers.toggleActive(id),
    });
  },
};
