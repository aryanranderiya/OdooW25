"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCheck, IconX } from "@tabler/icons-react";
import { ExpenseApproval, ApprovalAction } from "./types";
import { getInitials } from "./utils";
import { PriorityBadge } from "./priority-badge";
import { ExpenseDetailsDialog } from "./expense-details-dialog";
import { ApprovalActionDialog } from "./approval-action-dialog";

interface PendingApprovalsTableProps {
  expenses: ExpenseApproval[];
  onApprovalAction: (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => void;
}

export function PendingApprovalsTable({
  expenses,
  onApprovalAction,
}: PendingApprovalsTableProps) {
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseApproval | null>(null);
  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(
    null
  );
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const handleApprovalAction = (
    expense: ExpenseApproval,
    action: ApprovalAction
  ) => {
    setSelectedExpense(expense);
    setApprovalAction(action);
    setIsApprovalDialogOpen(true);
  };

  const handleSubmitApproval = (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => {
    onApprovalAction(expenseId, action, comment);
    setIsApprovalDialogOpen(false);
    setSelectedExpense(null);
    setApprovalAction(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Expense</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={expense.employeeAvatar} />
                    <AvatarFallback>
                      {getInitials(expense.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{expense.employeeName}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{expense.expenseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.date}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-semibold">{expense.amount}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>
                <PriorityBadge priority={expense.priority} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {expense.submittedAt}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ExpenseDetailsDialog expense={expense} />
                  <Button
                    size="sm"
                    onClick={() => handleApprovalAction(expense, "approve")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <IconCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprovalAction(expense, "reject")}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ApprovalActionDialog
        expense={selectedExpense}
        action={approvalAction}
        isOpen={isApprovalDialogOpen}
        onClose={() => {
          setIsApprovalDialogOpen(false);
          setSelectedExpense(null);
          setApprovalAction(null);
        }}
        onSubmit={handleSubmitApproval}
      />
    </>
  );
}
