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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApprovalRule, ApprovalRuleType } from "@/lib/approval-api";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";

interface ApprovalRulesListProps {
  rules: ApprovalRule[];
  onCreateRule: () => void;
  onEditRule: (rule: ApprovalRule) => void;
  onDeleteRule: (ruleId: string) => void;
}

export function ApprovalRulesList({
  rules,
  onCreateRule,
  onEditRule,
  onDeleteRule,
}: ApprovalRulesListProps) {
  const getRuleTypeBadge = (type: ApprovalRuleType) => {
    const variants: Record<ApprovalRuleType, string> = {
      [ApprovalRuleType.SEQUENTIAL]: "bg-blue-100 text-blue-800",
      [ApprovalRuleType.PERCENTAGE]: "bg-green-100 text-green-800",
      [ApprovalRuleType.SPECIFIC_APPROVER]: "bg-purple-100 text-purple-800",
      [ApprovalRuleType.HYBRID]: "bg-orange-100 text-orange-800",
    };

    const labels: Record<ApprovalRuleType, string> = {
      [ApprovalRuleType.SEQUENTIAL]: "Sequential",
      [ApprovalRuleType.PERCENTAGE]: "Percentage",
      [ApprovalRuleType.SPECIFIC_APPROVER]: "Specific Approver",
      [ApprovalRuleType.HYBRID]: "Hybrid",
    };

    return (
      <Badge className={variants[type]} variant="outline">
        {labels[type]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Rules</CardTitle>
            <CardDescription>
              Manage approval workflows and rules for expense approvals
            </CardDescription>
          </div>
          <Button onClick={onCreateRule}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount Range</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No approval rules found. Create your first rule to get
                    started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRuleTypeBadge(rule.ruleType)}</TableCell>
                  <TableCell>
                    {rule.minAmount && rule.maxAmount
                      ? `$${rule.minAmount} - $${rule.maxAmount}`
                      : rule.minAmount
                      ? `≥ $${rule.minAmount}`
                      : rule.maxAmount
                      ? `≤ $${rule.maxAmount}`
                      : "Any"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rule.ruleType === ApprovalRuleType.SPECIFIC_APPROVER
                      ? rule.specificApprover?.name
                      : `${rule.approvalSteps.length} steps`}
                    {rule.ruleType === ApprovalRuleType.PERCENTAGE &&
                      ` (${rule.percentageThreshold}%)`}
                    {rule.ruleType === ApprovalRuleType.HYBRID &&
                      ` (${rule.percentageThreshold}% OR ${rule.specificApprover?.name})`}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditRule(rule)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteRule(rule.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
