"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface ApprovalWorkflowProps {
  approvalActions: Array<{
    id: string;
    status: string;
    comment?: string;
    createdAt?: string;
    approver: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  approvalRule?: {
    name: string;
    ruleType: string;
    percentageThreshold?: number;
  };
}

export function ApprovalWorkflow({
  approvalActions,
  approvalRule,
}: ApprovalWorkflowProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <User className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={variants[status] || ""} variant="outline">
        {status}
      </Badge>
    );
  };

  if (!approvalActions || approvalActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Workflow</CardTitle>
        {approvalRule && (
          <p className="text-sm text-muted-foreground">
            Rule: {approvalRule.name} ({approvalRule.ruleType}
            {approvalRule.percentageThreshold &&
              ` - ${approvalRule.percentageThreshold}% threshold`}
            )
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvalActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(action.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium">{action.approver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.approver.email}
                    </p>
                  </div>
                  {getStatusBadge(action.status)}
                </div>

                {action.comment && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p className="font-medium mb-1">Comment:</p>
                    <p>{action.comment}</p>
                  </div>
                )}

                {action.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {action.status === "APPROVED" ? "Approved" : "Rejected"} on{" "}
                    {format(
                      new Date(action.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
