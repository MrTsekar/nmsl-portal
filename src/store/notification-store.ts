"use client";

import { create } from "zustand";
import { notificationsApi } from "@/lib/api/notifications.api";
import type { AppNotification, Notification } from "@/types";

type NotificationState = {
  // Legacy local notifications (for backwards compatibility)
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAllRead: () => void;

  // Backend API notifications
  apiNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchNotifications: (params?: { isRead?: boolean }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  decrementUnread: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Legacy state
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  // API state
  apiNotifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationsApi.getNotifications(params);
      set({
        apiNotifications: data.notifications,
        unreadCount: data.unreadCount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);

      // Update local state
      set((state) => ({
        apiNotifications: state.apiNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();

      // Update local state
      set((state) => ({
        apiNotifications: state.apiNotifications.map((notif) => ({
          ...notif,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  decrementUnread: () => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
}));

