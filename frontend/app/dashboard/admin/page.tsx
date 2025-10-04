"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalRulesList } from "@/components/approval-rules/approval-rules-list";
import { ApprovalRuleForm } from "@/components/approval-rules/approval-rule-form";
import { PendingApprovalsList } from "@/components/approval-rules/pending-approvals-list";
import { approvalApi, ApprovalRule, PendingApproval } from "@/lib/approval-api";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rules, approvals] = await Promise.all([
        approvalApi.getRules(),
        approvalApi.getPendingApprovals(),
      ]);
      setApprovalRules(rules);
      setPendingApprovals(approvals);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load approval data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleForm(true);
  };

  const handleEditRule = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setShowRuleForm(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this approval rule?")) {
      return;
    }

    try {
      await approvalApi.deleteRule(ruleId);
      setApprovalRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      toast({
        title: "Success",
        description: "Approval rule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting approval rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete approval rule",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRule = async (data: any) => {
    try {
      if (editingRule) {
        const updated = await approvalApi.updateRule(editingRule.id, data);
        setApprovalRules((prev) =>
          prev.map((rule) => (rule.id === editingRule.id ? updated : rule))
        );
        toast({
          title: "Success",
          description: "Approval rule updated successfully",
        });
      } else {
        const created = await approvalApi.createRule(data);
        setApprovalRules((prev) => [...prev, created]);
        toast({
          title: "Success",
          description: "Approval rule created successfully",
        });
      }
      setShowRuleForm(false);
      setEditingRule(null);
    } catch (error) {
      console.error("Error saving approval rule:", error);
      toast({
        title: "Error",
        description: "Failed to save approval rule",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (expenseId: string, comment?: string) => {
    try {
      await approvalApi.approveExpense(expenseId, comment);
      setPendingApprovals((prev) =>
        prev.filter((approval) => approval.expense.id !== expenseId)
      );
      toast({
        title: "Success",
        description: "Expense approved successfully",
      });
    } catch (error) {
      console.error("Error approving expense:", error);
      toast({
        title: "Error",
        description: "Failed to approve expense",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (expenseId: string, comment: string) => {
    try {
      await approvalApi.rejectExpense(expenseId, comment);
      setPendingApprovals((prev) =>
        prev.filter((approval) => approval.expense.id !== expenseId)
      );
      toast({
        title: "Success",
        description: "Expense rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting expense:", error);
      toast({
        title: "Error",
        description: "Failed to reject expense",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Approval Workflow
          </h1>
          <p className="text-muted-foreground">
            Manage expense approvals, approval chains, and workflow settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            Approval Rules ({approvalRules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingApprovalsList
            approvals={pendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <ApprovalRulesList
            rules={approvalRules}
            onCreateRule={handleCreateRule}
            onEditRule={handleEditRule}
            onDeleteRule={handleDeleteRule}
          />
        </TabsContent>
      </Tabs>

      <ApprovalRuleForm
        open={showRuleForm}
        onClose={() => {
          setShowRuleForm(false);
          setEditingRule(null);
        }}
        onSubmit={handleSubmitRule}
        initialData={editingRule}
      />
    </div>
  );
}
