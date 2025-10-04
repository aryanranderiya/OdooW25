"use client";

import ExpenseForm from "@/components/expense-form";
import { Expense, ExpenseStatus } from "@/lib/types/expense";

// Mock data - replace with actual API call
const mockExpense: Expense = {
  id: "2",
  title: "Travel Expense",
  description: "Client meeting transportation",
  originalAmount: 2500,
  originalCurrency: "INR",
  convertedAmount: 2500,
  companyCurrency: "INR",
  exchangeRate: 1,
  expenseDate: new Date("2024-09-28"),
  status: ExpenseStatus.PENDING_APPROVAL,
  submitterId: "1",
  submitter: { name: "John Doe", email: "john@company.com" },
  categoryId: "2",
  category: { name: "Travel" },
  receipts: [],
  submittedAt: new Date("2024-09-29"),
  createdAt: new Date("2024-09-28"),
  updatedAt: new Date("2024-09-29"),
  approvalRequests: [
    {
      id: "1",
      approver: { name: "Sarah Manager" },
      status: "PENDING",
      actionDate: undefined,
    },
  ],
};

export default function EditExpensePage() {
  const expense = mockExpense; // Temporarily use mock data

  if (!expense) {
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
    <ExpenseForm
      initialData={{
        title: expense.title,
        description: expense.description,
        originalAmount: expense.originalAmount,
        originalCurrency: expense.originalCurrency,
        expenseDate: expense.expenseDate,
        categoryId: expense.categoryId,
        receipts: [],
      }}
      isEditing={true}
      expenseId={expense.id}
      currentStatus={expense.status}
      approvalInfo={approvalInfo}
    />
  );
}
