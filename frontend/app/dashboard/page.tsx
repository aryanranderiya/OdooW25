"use client";

import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign } from "lucide-react";

function DashboardContent() {
  const { user, company, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <DollarSign className="size-5" />
            </div>
            <span className="text-lg font-semibold">Expense Management</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-muted-foreground text-xs">{user?.role}</div>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{company?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Country</div>
                  <div className="font-medium">{company?.country}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Currency</div>
                  <div className="font-medium">{company?.currency}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Role</div>
                  <div className="font-medium">{user?.role}</div>
                </div>
                {user?.manager && (
                  <div>
                    <div className="text-sm text-muted-foreground">Manager</div>
                    <div className="font-medium">{user.manager.name}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button className="w-full">Submit Expense</Button>
                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                  <Button variant="outline" className="w-full">
                    Review Expenses
                  </Button>
                )}
                {user?.role === "ADMIN" && (
                  <Button variant="outline" className="w-full">
                    Manage Users
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
