"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PendingApproval } from "@/lib/approval-api";
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface PendingApprovalsListProps {
  approvals: PendingApproval[];
  onApprove: (expenseId: string, comment?: string) => void;
  onReject: (expenseId: string, comment: string) => void;
}

export function PendingApprovalsList({
  approvals,
  onApprove,
  onReject,
}: PendingApprovalsListProps) {
  const [selectedApproval, setSelectedApproval] =
    useState<PendingApproval | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsApproval, setDetailsApproval] =
    useState<PendingApproval | null>(null);

  const handleAction = (
    approval: PendingApproval,
    actionType: "approve" | "reject"
  ) => {
    setSelectedApproval(approval);
    setAction(actionType);
    setComment("");
  };

  const submitAction = () => {
    if (!selectedApproval || !action) return;

    if (action === "approve") {
      onApprove(selectedApproval.expense.id, comment || undefined);
    } else {
      if (!comment.trim()) {
        alert("Comment is required for rejection");
        return;
      }
      onReject(selectedApproval.expense.id, comment);
    }

    setSelectedApproval(null);
    setAction(null);
    setComment("");
  };

  const showDetails = (approval: PendingApproval) => {
    setDetailsApproval(approval);
    setShowDetailsDialog(true);
  };

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals ({approvals.length})
          </CardTitle>
          <CardDescription>
            Review and approve or reject pending expense submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Expense</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No pending approvals at this time.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {approval.expense.submitter.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {approval.expense.submitter.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{approval.expense.title}</p>
                        {approval.expense.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {approval.expense.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        {approval.expense.originalAmount.toFixed(2)}{" "}
                        {approval.expense.originalCurrency}
                      </p>
                      {approval.expense.convertedAmount !==
                        approval.expense.originalAmount && (
                        <p className="text-sm text-muted-foreground">
                          ≈ {approval.expense.convertedAmount.toFixed(2)}{" "}
                          {approval.expense.companyCurrency}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(approval.expense.expenseDate),
                        "MMM dd, yyyy"
                      )}
                    </TableCell>
                    <TableCell>
                      {approval.expense.category?.name || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(approval.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showDetails(approval)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(approval, "approve")}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(approval, "reject")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedApproval && !!action}
        onOpenChange={() => {
          setSelectedApproval(null);
          setAction(null);
          setComment("");
        }}
      >
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

          {selectedApproval && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedApproval.expense.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedApproval.expense.submitter.name} •{" "}
                  {selectedApproval.expense.originalAmount.toFixed(2)}{" "}
                  {selectedApproval.expense.originalCurrency}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  {action === "approve"
                    ? "Comments (Optional)"
                    : "Rejection Reason *"}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={
                    action === "approve"
                      ? "Add any additional comments..."
                      : "Please explain why this expense is being rejected..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedApproval(null);
                setAction(null);
                setComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>

          {detailsApproval && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">
                      {detailsApproval.expense.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {detailsApproval.expense.originalAmount.toFixed(2)}{" "}
                      {detailsApproval.expense.originalCurrency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {detailsApproval.expense.category?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(detailsApproval.expense.expenseDate),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {detailsApproval.expense.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm">
                    {detailsApproval.expense.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Approval History</h3>
                {detailsApproval.expense.approvalActions.length > 0 ? (
                  <div className="space-y-2">
                    {detailsApproval.expense.approvalActions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{action.approver.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.approver.email}
                          </p>
                          {action.comment && (
                            <p className="text-sm mt-1">{action.comment}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(action.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(action.createdAt),
                              "MMM dd, HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No approval actions yet.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
