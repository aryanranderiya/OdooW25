"use client";

import { useNotifications as useNotificationContext } from "@/contexts/notification-context";

export function useNotifications() {
  return useNotificationContext();
}
