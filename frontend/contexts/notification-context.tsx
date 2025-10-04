"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { notificationApi, Notification } from "@/lib/notification-api";
import { useAuth } from "./auth-context";
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket(user?.id);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) {
      console.log("⚠️  Socket not available in NotificationProvider");
      return;
    }

    console.log("🔔 Setting up notification listeners");

    // Listen for new notifications
    socket.on("notification", (notification: Notification) => {
      console.log("📨 Received new notification:", notification);
      setNotifications((prev) => [notification, ...prev]);

      // Show toast for new notification
      const icon = getNotificationIcon(notification.type);
      toast(notification.title, {
        description: notification.message,
        icon: icon,
        duration: 5000,
      });
    });

    // Listen for unread count updates
    socket.on("unread-count", (count: number) => {
      console.log("🔢 Received unread count update:", count);
      setUnreadCount(count);
    });

    return () => {
      console.log("🔇 Removing notification listeners");
      socket.off("notification");
      socket.off("unread-count");
    };
  }, [socket]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "EXPENSE_SUBMITTED":
        return "📝";
      case "EXPENSE_APPROVED":
        return "✅";
      case "EXPENSE_REJECTED":
        return "❌";
      case "APPROVAL_REQUEST":
        return "⏳";
      case "EXPENSE_UPDATED":
        return "🔄";
      default:
        return "🔔";
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
