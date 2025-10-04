"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UsersCardProps {
  userCount: number;
  companyName?: string;
  onAddUser: () => void;
  children: React.ReactNode;
}

export function UsersCard({
  userCount,
  companyName,
  onAddUser,
  children,
}: UsersCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {userCount} user{userCount !== 1 ? "s" : ""} in {companyName}
            </CardDescription>
          </div>
          <Button onClick={onAddUser}>
            <Plus className="mr-2 size-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
