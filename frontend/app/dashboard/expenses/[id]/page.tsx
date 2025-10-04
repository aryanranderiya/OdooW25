"use client";

import { use } from "react";
import ExpenseForm from "@/components/expense-form";
import { useExpense } from "@/hooks/use-expenses";
import { AuthGuard } from "@/components/auth-guard";
import { ExpenseStatus } from "@/lib/types/expense";

export default function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: expense, error, isLoading } = useExpense(id);

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
            The expense you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  // Convert date string to Date object
  const expenseDate = typeof expense.expenseDate === 'string' 
    ? new Date(expense.expenseDate)
    : expense.expenseDate;

  const approvalInfo = expense.approvalRequests?.[0]
    ? {
        approver: expense.approvalRequests[0].approver.name,
        status: expense.approvalRequests[0].status,
        timestamp: expense.approvalRequests[0].actionDate
          ? new Date(expense.approvalRequests[0].actionDate).toLocaleString()
          : undefined,
      }
    : undefined;

  return (
    <AuthGuard>
      <ExpenseForm
        initialData={{
          title: expense.title,
          description: expense.description,
          originalAmount: expense.originalAmount,
          originalCurrency: expense.originalCurrency,
          expenseDate: expenseDate,
          categoryId: expense.categoryId,
          receipts: [],
        }}
        expenseId={expense.id}
        currentStatus={expense.status}
        approvalInfo={approvalInfo}
        mode="view"
      />
    </AuthGuard>
  );
}
