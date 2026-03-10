import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";

export const chatApi = {
  conversations: async () => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/chat/conversations");
        return data;
      },
      mock: () => mockHandlers.chat.conversations(),
    });
  },
  messages: async (conversationId: string) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
        return data;
      },
      mock: () => mockHandlers.chat.messages(conversationId),
    });
  },
};
