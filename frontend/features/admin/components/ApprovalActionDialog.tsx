"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExpenseApproval, ApprovalAction } from "./types";

interface ApprovalActionDialogProps {
  expense: ExpenseApproval | null;
  action: ApprovalAction | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => void;
}

export function ApprovalActionDialog({
  expense,
  action,
  isOpen,
  onClose,
  onSubmit,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!expense || !action) return;
    onSubmit(expense.id, action, comment);
    setComment("");
    onClose();
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  if (!expense || !action) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve Expense" : "Reject Expense"}
          </DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? "Provide any additional comments for this approval."
              : "Please provide a reason for rejecting this expense."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{expense.expenseTitle}</p>
            <p className="text-sm text-muted-foreground">
              {expense.employeeName} • {expense.amount}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval-comment">
              {action === "approve"
                ? "Comments (Optional)"
                : "Rejection Reason"}
            </Label>
            <Textarea
              id="approval-comment"
              placeholder={
                action === "approve"
                  ? "Add any additional comments..."
                  : "Please explain why this expense is being rejected..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              required={action === "reject"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={
              action === "approve" ? "bg-green-600 hover:bg-green-700" : ""
            }
            variant={action === "reject" ? "destructive" : "default"}
            disabled={action === "reject" && !comment.trim()}
          >
            {action === "approve" ? "Approve Expense" : "Reject Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
