"use client";

import { AuthGuard } from "@/components/auth-guard";
import { ExpenseChart } from "@/components/expense-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { useExpenses } from "@/hooks/use-expenses";
import { ROUTES } from "@/lib/constants";
import { Expense, ExpenseStatus, ExpenseSummary } from "@/lib/types/expense";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Plus,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          All amounts in {currency}
        </p>
      </CardContent>
    </Card>
  );
}

function ExpensePageContent() {
  const router = useRouter();
  const { company } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">(
    "ALL"
  );
  const limit = 50;

  const {
    data: expensesData,
    error,
    isLoading,
  } = useExpenses({
    page: currentPage,
    limit,
  });

  // Stabilize the expenses array to prevent unnecessary re-renders from SWR
  const expenses = useMemo(() => expensesData?.expenses || [], [expensesData]);
  const pagination = expensesData?.pagination;

  // Filter expenses by status
  const filteredExpenses = useMemo(() => {
    if (statusFilter === "ALL") return expenses;
    return expenses.filter((expense) => expense.status === statusFilter);
  }, [expenses, statusFilter]);

  // Stabilize the company currency to prevent unnecessary re-renders
  const companyCurrency = useMemo(
    () => company?.currency || "USD",
    [company?.currency]
  );

  // Use a simple computed summary instead of state + useEffect
  const summary = useMemo((): ExpenseSummary => {
    const emptySummary = {
      toSubmit: { count: 0, totalAmount: 0, currency: companyCurrency },
      waitingApproval: { count: 0, totalAmount: 0, currency: companyCurrency },
      approved: { count: 0, totalAmount: 0, currency: companyCurrency },
    };

    if (!expenses.length) {
      return emptySummary;
    }

    const newSummary = {
      toSubmit: { count: 0, totalAmount: 0, currency: companyCurrency },
      waitingApproval: { count: 0, totalAmount: 0, currency: companyCurrency },
      approved: { count: 0, totalAmount: 0, currency: companyCurrency },
    };

    // Use the converted amount that should already be provided by the backend
    for (const expense of expenses) {
      const amount = expense.convertedAmount || expense.originalAmount;

      switch (expense.status) {
        case ExpenseStatus.DRAFT:
          newSummary.toSubmit.count++;
          newSummary.toSubmit.totalAmount += amount;
          break;
        case ExpenseStatus.PENDING_APPROVAL:
          newSummary.waitingApproval.count++;
          newSummary.waitingApproval.totalAmount += amount;
          break;
        case ExpenseStatus.APPROVED:
          newSummary.approved.count++;
          newSummary.approved.totalAmount += amount;
          break;
      }
    }

    return newSummary;
  }, [expenses, companyCurrency]);
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
            <Button asChild>
              <Link href={ROUTES.CREATE_EXPENSE}>
                <Plus className="h-4 w-4" />
                Create New Expense
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
        {!isLoading && (
          <div className="mb-8">
            <ExpenseChart expenses={expenses} currency={companyCurrency} />
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            onClick={() => setStatusFilter("ALL")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={
              statusFilter === ExpenseStatus.DRAFT ? "default" : "outline"
            }
            onClick={() => setStatusFilter(ExpenseStatus.DRAFT)}
            className="rounded-full"
          >
            Draft
          </Button>
          <Button
            variant={
              statusFilter === ExpenseStatus.PENDING_APPROVAL
                ? "default"
                : "outline"
            }
            onClick={() => setStatusFilter(ExpenseStatus.PENDING_APPROVAL)}
            className="rounded-full"
          >
            Waiting Approval
          </Button>
          <Button
            variant={
              statusFilter === ExpenseStatus.APPROVED ? "default" : "outline"
            }
            onClick={() => setStatusFilter(ExpenseStatus.APPROVED)}
            className="rounded-full"
          >
            Approved
          </Button>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">Loading expenses...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {statusFilter === "ALL"
                    ? "No expenses found"
                    : `No ${statusFilter
                        .toLowerCase()
                        .replace(/_/g, " ")} expenses found`}
                </p>
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
                  {filteredExpenses.map((expense: Expense) => (
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} expenses
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
