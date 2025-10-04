"use client";

import { NotificationProvider } from "@/contexts/notification-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
