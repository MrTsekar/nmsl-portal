"use client";

import { create } from "zustand";
import type { AppNotification } from "@/types";

type NotificationState = {
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));

