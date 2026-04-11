"use client";

import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { Notification } from "@/types";

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { apiNotifications, unreadCount, error, fetchNotifications, markAsRead, markAllNotificationsAsRead } =
    useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications({ isRead: false });
  }, [fetchNotifications]);

  // Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ isRead: false });
    }
  }, [isOpen, fetchNotifications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchNotifications({ isRead: false });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="danger"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs text-primary hover:text-primary"
            >
              Mark all read
            </Button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 max-h-[400px]">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">Failed to load notifications</p>
              <p className="text-xs text-muted-foreground mt-1">Backend API error</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3" 
                onClick={() => fetchNotifications({ isRead: false })}
              >
                Retry
              </Button>
            </div>
          ) : apiNotifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            apiNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer flex flex-col items-start gap-1 border-b last:border-0 ${
                  !notification.isRead ? "bg-accent/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-medium text-sm leading-tight">{notification.title}</span>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <span className="text-xs text-muted-foreground/70">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full text-xs h-8"
            onClick={() => {
              setIsOpen(false);
              router.push("/app/notifications");
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
