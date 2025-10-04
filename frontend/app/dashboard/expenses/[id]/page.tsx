"use client";

import { use } from "react";
import ExpenseView from "@/components/expense-view";
import { useExpense } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { AuthGuard } from "@/components/auth-guard";

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: expense, error, isLoading } = useExpense(id);
  const { categories } = useCategories();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Expense Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The expense you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  // Convert date string to Date object
  const expenseDate =
    typeof expense.expenseDate === "string"
      ? new Date(expense.expenseDate)
      : expense.expenseDate;

  const approvalInfo = expense.approvalActions?.[0]
    ? {
        approver: expense.approvalActions[0].approver.name,
        status: expense.approvalActions[0].status,
        timestamp: expense.approvalActions[0].createdAt
          ? new Date(expense.approvalActions[0].createdAt).toLocaleString()
          : undefined,
      }
    : undefined;

  return (
    <AuthGuard>
      <ExpenseView
        expense={{
          title: expense.title,
          description: expense.description,
          originalAmount: expense.originalAmount,
          originalCurrency: expense.originalCurrency,
          convertedAmount: expense.convertedAmount,
          companyCurrency: expense.companyCurrency,
          exchangeRate: expense.exchangeRate,
          expenseDate: expenseDate,
          categoryId: expense.categoryId,
          status: expense.status,
        }}
        categories={categories}
        approvalInfo={approvalInfo}
      />
    </AuthGuard>
  );
}
