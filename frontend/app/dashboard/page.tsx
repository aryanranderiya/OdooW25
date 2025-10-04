"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import ExpenseList from "@/components/expense-list";
import ExpenseSummary from "@/components/expense-summary";

function DashboardContent() {
  const { user, company } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/40">
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
                  <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.USERS)}>
                    Manage Users
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Show expense information for all users who can submit expenses */}
        {user && (
          <div className="space-y-6 mt-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Expenses</h2>
              <p className="text-muted-foreground">Track and manage your submitted expenses</p>
            </div>
            <ExpenseSummary />
            <ExpenseList limit={10} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    // <AuthGuard>
    <DashboardContent />
    // </AuthGuard>
  );
}
