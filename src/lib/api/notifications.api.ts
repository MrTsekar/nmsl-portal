import { apiClient } from "@/lib/api/client";
import type { Notification, NotificationsResponse, NotificationType } from "@/types";

export const notificationsApi = {
  /**
   * Fetch user notifications
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: NotificationType;
  }): Promise<NotificationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.isRead !== undefined) queryParams.set("isRead", params.isRead.toString());
    if (params?.type) queryParams.set("type", params.type);

    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const { data } = await apiClient.get<NotificationsResponse>(url);
    return data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(`/notifications/${notificationId}/mark-read`);
    return data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean; markedCount: number }> => {
    const { data } = await apiClient.post<{ success: boolean; markedCount: number }>("/notifications/mark-all-read");
    return data;
  },
};
