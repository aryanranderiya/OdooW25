import { api } from "./api-client";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = {
  getNotifications: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await api.get(
      `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post("/notifications/mark-all-read");
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
