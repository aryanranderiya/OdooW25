"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useExpenses } from "@/hooks/use-expenses";
import { useMemo } from "react";
import { ExpenseStatus, ExpenseSummary } from "@/lib/types/expense";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  FileText,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ExpenseByCategoryChart } from "@/components/charts/expense-by-category-chart";
import { ExpenseByStatusChart } from "@/components/charts/expense-by-status-chart";
import { ExpenseTrendsChart } from "@/components/charts/expense-trends-chart";
import { MonthlyExpenseChart } from "@/components/charts/monthly-expense-chart";

function getStatusBadge(status: ExpenseStatus) {
  switch (status) {
    case ExpenseStatus.DRAFT:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-full font-medium"
        >
          Draft
        </Badge>
      );
    case ExpenseStatus.PENDING_APPROVAL:
      return (
        <Badge
          variant="outline"
          className="border-yellow-300 text-yellow-700 bg-yellow-50 rounded-full font-medium"
        >
          Pending
        </Badge>
      );
    case ExpenseStatus.APPROVED:
      return (
        <Badge
          variant="outline"
          className="border-green-300 text-green-700 bg-green-50 rounded-full font-medium"
        >
          Approved
        </Badge>
      );
    case ExpenseStatus.REJECTED:
      return (
        <Badge
          variant="outline"
          className="border-red-300 text-red-700 bg-red-50 rounded-full font-medium"
        >
          Rejected
        </Badge>
      );
    case ExpenseStatus.CANCELLED:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-full font-medium"
        >
          Cancelled
        </Badge>
      );
    default:
      return null;
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
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(amount, currency)}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {count} {count === 1 ? "expense" : "expenses"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { user, company } = useAuth();
  const router = useRouter();

  const { data: expensesData, isLoading } = useExpenses({
    page: 1,
    limit: 5,
  });

  // Fetch all expenses for charts (without pagination)
  const { data: allExpensesData } = useExpenses({
    page: 1,
    limit: 1000, // Get enough for chart analysis
  });

  const expenses = useMemo(() => expensesData?.expenses || [], [expensesData]);
  const allExpenses = useMemo(
    () => allExpensesData?.expenses || [],
    [allExpensesData]
  );
  const companyCurrency = useMemo(
    () => company?.currency || "USD",
    [company?.currency]
  );

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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your expenses
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Submit Expense
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create new expense
                  </p>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={ROUTES.CREATE_EXPENSE}>Create Expense</Link>
              </Button>
            </CardContent>
          </Card>

          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Review Expenses
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Approve or reject
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Review Now
                </Button>
              </CardContent>
            </Card>
          )}

          {user?.role === "ADMIN" && (
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Manage Users
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add or edit users
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(ROUTES.USERS)}
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Section */}
        {allExpenses.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Expense Analytics
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visual insights into your spending patterns
              </p>
            </div>

            {/* Trends Chart - Full Width */}
            <div className="mb-4">
              <ExpenseTrendsChart
                expenses={allExpenses}
                currency={companyCurrency}
              />
            </div>

            {/* Category, Status, and Monthly Charts - Single Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ExpenseByCategoryChart
                expenses={allExpenses}
                currency={companyCurrency}
              />
              <ExpenseByStatusChart
                expenses={allExpenses}
                currency={companyCurrency}
              />
              <MonthlyExpenseChart
                expenses={allExpenses}
                currency={companyCurrency}
              />
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Recent Expenses
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your 5 most recent expense submissions
              </p>
            </div>
            <Button asChild>
              <Link
                href={ROUTES.CREATE_EXPENSE}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Expense
              </Link>
            </Button>
          </div>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm py-0">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-zinc-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first expense to get started
                  </p>
                  <Button asChild>
                    <Link href={ROUTES.CREATE_EXPENSE}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Expense
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {expenses.map((expense, index) => (
                    <div
                      key={expense.id}
                      className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                      onClick={() =>
                        router.push(ROUTES.EXPENSE_DETAIL(expense.id))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {expense.title}
                            </h3>
                            {getStatusBadge(expense.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(expense.expenseDate)}
                            </span>
                            {expense.category && (
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                {expense.category.name}
                              </span>
                            )}
                          </div>
                          {expense.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {formatCurrency(
                                expense.convertedAmount,
                                expense.companyCurrency
                              )}
                            </p>
                            {expense.originalCurrency !==
                              expense.companyCurrency && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatCurrency(
                                  expense.originalAmount,
                                  expense.originalCurrency
                                )}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {expenses.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                asChild
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Link
                  href={ROUTES.EXPENSES}
                  className="flex items-center gap-2"
                >
                  View All Expenses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Profile & Company Info */}
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Your Profile
                </h3>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                    Email
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                    Role
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {user?.role}
                  </div>
                </div>
                {user?.manager && (
                  <div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                      Manager
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {user.manager.name}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Company
                </h3>
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                    Name
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {company?.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                    Country
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {company?.country}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-0.5">
                    Currency
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {company?.currency}
                  </div>
                </div>
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
    // <AuthGuard>
    <DashboardContent />
    // </AuthGuard>
  );
}
