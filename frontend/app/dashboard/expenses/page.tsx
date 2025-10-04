"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Mock data - replace with actual API calls
const mockExpenses: Expense[] = [
  {
    id: "1",
    title: "Restaurant Bill",
    description: "Team lunch meeting",
    originalAmount: 5000,
    originalCurrency: "INR",
    convertedAmount: 5000,
    companyCurrency: "INR",
    exchangeRate: 1,
    expenseDate: new Date("2024-10-01"),
    status: ExpenseStatus.DRAFT,
    submitterId: "1",
    submitter: { name: "John Doe", email: "john@company.com" },
    categoryId: "1",
    category: { name: "Food" },
    receipts: [],
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
  },
  {
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
  },
  {
    id: "3",
    title: "Office Supplies",
    description: "Stationery for team",
    originalAmount: 1500,
    originalCurrency: "INR",
    convertedAmount: 1500,
    companyCurrency: "INR",
    exchangeRate: 1,
    expenseDate: new Date("2024-09-25"),
    status: ExpenseStatus.APPROVED,
    submitterId: "1",
    submitter: { name: "John Doe", email: "john@company.com" },
    categoryId: "3",
    category: { name: "Office" },
    receipts: [],
    submittedAt: new Date("2024-09-26"),
    approvedAt: new Date("2024-09-27"),
    createdAt: new Date("2024-09-25"),
    updatedAt: new Date("2024-09-27"),
  },
];

function getStatusBadge(status: ExpenseStatus) {
  switch (status) {
    case ExpenseStatus.DRAFT:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 text-zinc-600 bg-zinc-50 rounded-full"
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
          className="border-zinc-300 text-zinc-600 bg-zinc-50 rounded-full"
        >
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-zinc-300 text-zinc-600 bg-zinc-50 rounded-full"
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
        <CardTitle className="text-sm font-semibold text-zinc-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-zinc-400" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-zinc-900 mb-2">
          {formatCurrency(amount, currency)}
        </div>
        <p className="text-sm text-zinc-500 font-medium">
          {count} {count === 1 ? "expense" : "expenses"}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [summary, setSummary] = useState<ExpenseSummary>({
    toSubmit: { count: 0, totalAmount: 0, currency: "INR" },
    waitingApproval: { count: 0, totalAmount: 0, currency: "INR" },
    approved: { count: 0, totalAmount: 0, currency: "INR" },
  });

  useEffect(() => {
    // Calculate summary from expenses
    const newSummary = expenses.reduce(
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
        toSubmit: { count: 0, totalAmount: 0, currency: "INR" },
        waitingApproval: { count: 0, totalAmount: 0, currency: "INR" },
        approved: { count: 0, totalAmount: 0, currency: "INR" },
      }
    );

    setSummary(newSummary);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">
              Expenses
            </h1>
            <p className="text-lg text-zinc-600 font-medium">
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
                <Plus className="h-4 w-4" />
                New Expense
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
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

        {/* Expenses Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-zinc-400" />
                        <div>
                          <div className="font-medium text-zinc-900">
                            {expense.submitter.name}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {expense.submitter.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-zinc-900">
                          {expense.title}
                        </div>
                        {expense.description && (
                          <div className="text-sm text-zinc-500">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell>{expense.category?.name || "-"}</TableCell>
                    <TableCell>Personal Card</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      {formatCurrency(
                        expense.originalAmount,
                        expense.originalCurrency
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(expense.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
