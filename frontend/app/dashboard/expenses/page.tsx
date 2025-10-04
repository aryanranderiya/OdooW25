"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseChart } from "@/components/expense-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Plus,
  FileText,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { Expense, ExpenseStatus, ExpenseSummary } from "@/lib/types/expense";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useExpenses } from "@/hooks/use-expenses";
import { AuthGuard } from "@/components/auth-guard";

function getStatusBadge(status: ExpenseStatus) {
  switch (status) {
    case ExpenseStatus.DRAFT:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-full"
        >
          Draft
        </Badge>
      );
    case ExpenseStatus.PENDING_APPROVAL:
      return (
        <Badge
          variant="outline"
          className="border-yellow-300 text-yellow-700 bg-yellow-50  rounded-full"
        >
          Waiting Approval
        </Badge>
      );
    case ExpenseStatus.APPROVED:
      return (
        <Badge
          variant="outline"
          className="border-green-300 text-green-700 bg-green-50 rounded-full"
        >
          Approved
        </Badge>
      );
    case ExpenseStatus.REJECTED:
      return (
        <Badge
          variant="outline"
          className="border-red-300 text-red-700 bg-red-50 rounded-full"
        >
          Rejected
        </Badge>
      );
    case ExpenseStatus.CANCELLED:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-full"
        >
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-full"
        >
          Unknown
        </Badge>
      );
  }
}

function StatCard({
  title,
  amount,
  currency,
  count,
  icon: Icon,
}: {
  title: string;
  amount: number;
  currency: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {formatCurrency(amount, currency)}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          {count} {count === 1 ? "expense" : "expenses"}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">All amounts in {currency}</p>
      </CardContent>
    </Card>
  );
}

function ExpensePageContent() {
  const router = useRouter();
  const { data: expenses = [], error, isLoading } = useExpenses();
  // const [summary, setSummary] = useState<ExpenseSummary>({
  //   toSubmit: { count: 0, totalAmount: 0, currency: "USD" },
  //   waitingApproval: { count: 0, totalAmount: 0, currency: "USD" },
  //   approved: { count: 0, totalAmount: 0, currency: "USD" },
  // });

  // Calculate summary from expenses
  const summary = expenses.reduce(
    (acc, expense) => {
      switch (expense.status) {
        case ExpenseStatus.DRAFT:
          acc.toSubmit.count++;
          acc.toSubmit.totalAmount += expense.convertedAmount;
          break;
        case ExpenseStatus.PENDING_APPROVAL:
          acc.waitingApproval.count++;
          acc.waitingApproval.totalAmount += expense.convertedAmount;
          break;
        case ExpenseStatus.APPROVED:
          acc.approved.count++;
          acc.approved.totalAmount += expense.convertedAmount;
          break;
      }
      return acc;
    },
    {
      toSubmit: { count: 0, totalAmount: 0, currency: "USD" },
      waitingApproval: { count: 0, totalAmount: 0, currency: "USD" },
      approved: { count: 0, totalAmount: 0, currency: "USD" },
    }
  );

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          Failed to load expenses
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              Expenses
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium">
              Manage your expense submissions and approvals
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4" />
              Upload Receipt
            </Button>
            <Button asChild>
              <Link href={ROUTES.CREATE_EXPENSE}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatCard
            title="To Submit"
            amount={summary.toSubmit.totalAmount}
            currency={summary.toSubmit.currency}
            count={summary.toSubmit.count}
            icon={FileText}
          />
          <StatCard
            title="Waiting Approval"
            amount={summary.waitingApproval.totalAmount}
            currency={summary.waitingApproval.currency}
            count={summary.waitingApproval.count}
            icon={Calendar}
          />
          <StatCard
            title="Approved"
            amount={summary.approved.totalAmount}
            currency={summary.approved.currency}
            count={summary.approved.count}
            icon={DollarSign}
          />
        </div>

        {/* Expense Chart */}
        <div className="mb-8">
          <ExpenseChart expenses={expenses} currency="USD" />
        </div>

        {/* Expenses Table */}
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No expenses found</p>
                <Button asChild>
                  <Link href={ROUTES.CREATE_EXPENSE}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first expense
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense: Expense) => (
                    <TableRow
                      key={expense.id}
                      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() =>
                        router.push(ROUTES.EXPENSE_DETAIL(expense.id))
                      }
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {expense.submitter.name}
                            </div>
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                              {expense.submitter.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {expense.title}
                          </div>
                          {expense.description && (
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                              {expense.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                      <TableCell>{expense.category?.name || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(
                              expense.convertedAmount,
                              expense.companyCurrency
                            )}
                          </div>
                          {expense.originalCurrency !==
                            expense.companyCurrency && (
                            <div className="text-xs text-zinc-500">
                              {formatCurrency(
                                expense.originalAmount,
                                expense.originalCurrency
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(expense.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <AuthGuard>
      <ExpensePageContent />
    </AuthGuard>
  );
}
