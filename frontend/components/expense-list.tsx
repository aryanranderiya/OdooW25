"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExpenseStatus } from "@/lib/types/expense";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Eye, Plus } from "lucide-react";

interface ExpenseListProps {
  limit?: number;
  showTitle?: boolean;
}

const statusColors: Record<ExpenseStatus, string> = {
  [ExpenseStatus.DRAFT]: "bg-gray-500",
  [ExpenseStatus.PENDING_APPROVAL]: "bg-yellow-500",
  [ExpenseStatus.APPROVED]: "bg-green-500",
  [ExpenseStatus.REJECTED]: "bg-red-500",
  [ExpenseStatus.CANCELLED]: "bg-gray-500",
};

const statusLabels: Record<ExpenseStatus, string> = {
  [ExpenseStatus.DRAFT]: "Draft",
  [ExpenseStatus.PENDING_APPROVAL]: "Pending",
  [ExpenseStatus.APPROVED]: "Approved",
  [ExpenseStatus.REJECTED]: "Rejected",
  [ExpenseStatus.CANCELLED]: "Cancelled",
};

export default function ExpenseList({ limit = 5, showTitle = true }: ExpenseListProps) {
  const { data: expenses, error, isLoading } = useExpenses({ limit });
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your submitted expense reports</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-3 w-[60px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your submitted expense reports</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load expenses</p>
            <p className="text-sm text-red-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your submitted expense reports</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses found</p>
            <p className="text-sm text-muted-foreground mb-4">Submit your first expense to see it here</p>
            <Button onClick={() => router.push("/expenses/create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create First Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your submitted expense reports</CardDescription>
            </div>
            <Button size="sm" onClick={() => router.push("/dashboard/expenses/create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Expense
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/expenses/${expense.id}`)}>
              <div className="space-y-1 flex-1">
                <div className="font-medium group-hover:text-primary transition-colors">{expense.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(new Date(expense.expenseDate))}
                  {expense.category && ` • ${expense.category.name}`}
                </div>
                {expense.description && <div className="text-sm text-muted-foreground max-w-md truncate">{expense.description}</div>}
              </div>
              <div className="space-y-2 text-right flex items-center gap-4">
                <div>
                  <div className="font-medium">{formatCurrency(expense.convertedAmount, expense.companyCurrency)}</div>
                  <Badge variant="secondary" className={`${statusColors[expense.status]} text-white`}>
                    {statusLabels[expense.status]}
                  </Badge>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
