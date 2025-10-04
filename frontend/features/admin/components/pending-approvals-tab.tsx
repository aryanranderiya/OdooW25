"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconClock } from "@tabler/icons-react";
import { ExpenseApproval, ApprovalAction } from "./types";
import { PendingApprovalsTable } from "./pending-approvals-table";

interface PendingApprovalsTabProps {
  expenses: ExpenseApproval[];
  onApprovalAction: (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => void;
}

export function PendingApprovalsTab({
  expenses,
  onApprovalAction,
}: PendingApprovalsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconClock className="h-5 w-5" />
          Pending Approvals ({expenses.length})
        </CardTitle>
        <CardDescription>
          Review and approve or reject pending expense submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PendingApprovalsTable
          expenses={expenses}
          onApprovalAction={onApprovalAction}
        />
      </CardContent>
    </Card>
  );
}
