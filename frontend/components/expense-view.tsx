"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/currency";
import { ExpenseStatus } from "@/lib/types/expense";
import { format } from "date-fns";
import type { Category, ApprovalAction } from "@/lib/types/expense";
import { Badge } from "@/components/ui/badge";

interface ExpenseViewProps {
  expense: {
    title: string;
    description?: string;
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    companyCurrency: string;
    exchangeRate: number;
    expenseDate: Date;
    categoryId?: string;
    status: ExpenseStatus;
  };
  categories: Category[];
  approvalActions?: ApprovalAction[];
}

export default function ExpenseView({
  expense,
  categories,
  approvalActions = [],
}: ExpenseViewProps) {
  // Apple-like status styling
  const getStatusConfig = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.DRAFT:
        return {
          color: "text-zinc-600 dark:text-zinc-400",
          bg: "bg-zinc-100 dark:bg-zinc-800",
          label: "Draft",
        };
      case ExpenseStatus.PENDING_APPROVAL:
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          label: "Pending Approval",
        };
      case ExpenseStatus.APPROVED:
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Approved",
        };
      case ExpenseStatus.REJECTED:
        return { color: "text-red-600", bg: "bg-red-50", label: "Rejected" };
      case ExpenseStatus.CANCELLED:
        return {
          color: "text-zinc-500 dark:text-zinc-400",
          bg: "bg-zinc-100 dark:bg-zinc-800",
          label: "Cancelled",
        };
      default:
        return {
          color: "text-zinc-600 dark:text-zinc-400",
          bg: "bg-zinc-100 dark:bg-zinc-800",
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(expense.status);

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || ""} variant="outline">
        {status}
      </Badge>
    );
  };

  console.log(approvalActions);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Expense Details
            </h1>
            <div className={`px-4 py-2 rounded-full ${statusConfig.bg}`}>
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Review your expense submission
          </p>
        </div>

        <Card>
          <CardContent className="space-y-8">
            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Description
              </p>
              <p className="text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                {expense.title}
              </p>
            </div>

            {/* Amount - Prominent Display */}
            <div className="py-6 space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Amount
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {getCurrencySymbol(expense.originalCurrency)}
                  {expense.originalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">
                  {expense.originalCurrency}
                </p>
              </div>
              {expense.originalCurrency !== expense.companyCurrency &&
                expense.convertedAmount && (
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-2xl font-semibold text-zinc-600 dark:text-zinc-400">
                      ≈ {getCurrencySymbol(expense.companyCurrency)}
                      {expense.convertedAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {expense.companyCurrency} (Company Currency)
                    </p>
                  </div>
                )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Date
                </p>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {format(expense.expenseDate, "MMMM dd, yyyy")}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Category
                </p>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {categories.find((c) => c.id === expense.categoryId)?.name ||
                    "—"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Status
                </p>
                <div
                  className={`inline-flex px-3 py-1 rounded-full ${statusConfig.bg}`}
                >
                  <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval History Section */}
            {approvalActions && approvalActions.length > 0 && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Approval History
                </h3>
                <div className="space-y-2">
                  {approvalActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {action.approver.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {action.approver.email}
                        </p>
                        {action.comment && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                            {action.comment}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(action.status)}
                        <p
                          className="text-xs text-zinc-500 dark:text-zinc-400"
                          suppressHydrationWarning
                        >
                          {format(new Date(action.createdAt), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details Section */}
            {expense.description && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Additional Details
                </h3>
                <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {expense.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
