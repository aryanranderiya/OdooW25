"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getCurrencySymbol } from "@/lib/currency";
import { ExpenseStatus } from "@/lib/types/expense";
import { format } from "date-fns";
import type { Category } from "@/lib/types/expense";

interface ExpenseViewProps {
  expense: {
    title: string;
    description?: string;
    originalAmount: number;
    originalCurrency: string;
    expenseDate: Date;
    categoryId?: string;
    status: ExpenseStatus;
  };
  categories: Category[];
  approvalInfo?: {
    approver: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    timestamp?: string;
  };
}

export default function ExpenseView({
  expense,
  categories,
  approvalInfo,
}: ExpenseViewProps) {
  // Apple-like status styling
  const getStatusConfig = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.DRAFT:
        return { color: "text-zinc-600", bg: "bg-zinc-100", label: "Draft" };
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
          color: "text-zinc-500",
          bg: "bg-zinc-100",
          label: "Cancelled",
        };
      default:
        return { color: "text-zinc-600", bg: "bg-zinc-100", label: "Unknown" };
    }
  };

  const statusConfig = getStatusConfig(expense.status);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight">
              Expense Details
            </h1>
            <div className={`px-4 py-2 rounded-full ${statusConfig.bg}`}>
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <p className="text-lg text-zinc-500">
            Review your expense submission
          </p>
        </div>

        <Card>
          <CardContent className="space-y-8">
            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Description
              </p>
              <p className="text-xl font-medium text-zinc-900 leading-relaxed">
                {expense.title}
              </p>
            </div>

            {/* Amount - Prominent Display */}
            <div className="py-6 space-y-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Amount
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-semibold text-zinc-900">
                  {getCurrencySymbol(expense.originalCurrency)}
                  {expense.originalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-lg text-zinc-500">
                  {expense.originalCurrency}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-100">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Date
                </p>
                <p className="text-base font-medium text-zinc-900">
                  {format(expense.expenseDate, "MMMM dd, yyyy")}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Category
                </p>
                <p className="text-base font-medium text-zinc-900">
                  {categories.find((c) => c.id === expense.categoryId)?.name ||
                    "—"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
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

            {/* Approval Information Section */}
            {approvalInfo && (
              <div className="pt-8 border-t border-zinc-100 space-y-6">
                <h3 className="text-base font-semibold text-zinc-900">
                  Approval Information
                </h3>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Approver
                    </p>
                    <p className="text-base font-medium text-zinc-900">
                      {approvalInfo.approver}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Decision
                    </p>
                    <div
                      className={`inline-flex px-3 py-1 rounded-full ${
                        approvalInfo.status === "APPROVED"
                          ? "bg-green-50"
                          : approvalInfo.status === "REJECTED"
                          ? "bg-red-50"
                          : "bg-amber-50"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          approvalInfo.status === "APPROVED"
                            ? "text-green-600"
                            : approvalInfo.status === "REJECTED"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {approvalInfo.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-base font-medium text-zinc-900">
                      {approvalInfo.timestamp || "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details Section */}
            {expense.description && (
              <div className="pt-8 border-t border-zinc-100 space-y-4">
                <h3 className="text-base font-semibold text-zinc-900">
                  Additional Details
                </h3>
                <p className="text-base text-zinc-600 leading-relaxed">
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
