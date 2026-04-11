"use client";

import { create } from "zustand";
import { notificationsApi } from "@/lib/api/notifications.api";
import type { AppNotification, Notification } from "@/types";

type NotificationError = {
  message: string;
  code?: number;
  canRetry: boolean;
} | null;

type NotificationState = {
  // Legacy local notifications (for backwards compatibility)
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAllRead: () => void;

  // Backend API notifications
  apiNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: NotificationError;

  // API Actions
  fetchNotifications: (params?: { isRead?: boolean }) => Promise<void>;
  fetchWithRetry: (params?: { isRead?: boolean }, retries?: number, delay?: number) => Promise<void>;
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
        error: null,
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch notifications:", error);
      const statusCode = error?.response?.status;
      set({
        error: {
          message: statusCode === 500
            ? "Server error. Please try again later."
            : error instanceof Error
            ? error.message
            : "Failed to load notifications",
          code: statusCode,
          canRetry: true,
        },
        isLoading: false,
      });
    }
  },

  fetchWithRetry: async (params, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await get().fetchNotifications(params);
        return; // Success, exit
      } catch (error) {
        if (i === retries - 1) {
          // Last attempt failed, error already set by fetchNotifications
          return;
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
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

