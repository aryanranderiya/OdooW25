"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserManagementHeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export function UserManagementHeader({
  userName,
  userRole,
  onLogout,
}: UserManagementHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <DollarSign className="size-5" />
            </div>
            <span className="text-lg font-semibold">Expense Management</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <div className="font-medium">{userName}</div>
            <div className="text-muted-foreground text-xs">{userRole}</div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
