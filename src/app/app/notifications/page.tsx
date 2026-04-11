"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notification-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Bell, Mail, KeyRound, FileText, Pill, MessageSquare, PlusCircle, Trash2, UserPlus, UserMinus, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import type { Notification, NotificationType } from "@/types";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  password_changed: <KeyRound className="h-5 w-5" />,
  email_changed: <Mail className="h-5 w-5" />,
  account_security: <KeyRound className="h-5 w-5" />,
  new_prescription: <Pill className="h-5 w-5" />,
  new_result: <FileText className="h-5 w-5" />,
  service_added: <PlusCircle className="h-5 w-5" />,
  service_updated: <FileText className="h-5 w-5" />,
  service_deleted: <Trash2 className="h-5 w-5" />,
  board_member_added: <UserPlus className="h-5 w-5" />,
  board_member_removed: <UserMinus className="h-5 w-5" />,
  contact_form_submitted: <MessageSquare className="h-5 w-5" />,
  new_message: <MessageSquare className="h-5 w-5" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"unread" | "all">("unread");
  const { apiNotifications, isLoading, error, fetchWithRetry, markAsRead, markAllNotificationsAsRead } =
    useNotificationStore();

  useEffect(() => {
    fetchWithRetry({ isRead: filter === "all" ? undefined : false });
  }, [filter, fetchWithRetry]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const unreadNotifications = apiNotifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Notifications"
        subtitle="Stay updated with important alerts and messages"
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">All Notifications</h2>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={markAllNotificationsAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as "unread" | "all")} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="unread" className="flex-1 sm:flex-none">
                Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 sm:flex-none">
                All
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="mt-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground mt-2">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Unable to Load Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    {error.message}
                  </p>
                  {error.code === 500 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      The server is experiencing issues. Our team has been notified.
                    </p>
                  )}
                </div>

                {error.canRetry && (
                  <Button
                    onClick={() => fetchWithRetry({ isRead: filter === "all" ? undefined : false })}
                    variant="outline"
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            ) : apiNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  You'll be notified about important updates here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {apiNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                      !notification.isRead ? "bg-accent/20" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        !notification.isRead 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base">{notification.title}</h3>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
