"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PendingApprovalsTab,
  ApprovalChainsTab,
  NotificationsTab,
  EscalationSettingsTab,
  ApprovalAPI,
  ExpenseApproval,
  ApprovalChain,
  ApprovalAction,
  NotificationSettings,
  EscalationSettings,
} from "@/features/admin/components";

export default function Page() {
  // State for data
  const [pendingApprovals, setPendingApprovals] = useState<ExpenseApproval[]>(
    []
  );
  const [approvalChains, setApprovalChains] = useState<ApprovalChain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for settings
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      inAppNotifications: true,
      escalationReminders: true,
    });

  const [escalationSettings, setEscalationSettings] =
    useState<EscalationSettings>({
      defaultEscalationDays: 3,
      maxEscalationLevels: 5,
      weekendEscalation: false,
      autoApproveOnFinalEscalation: false,
    });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [approvals, chains] = await Promise.all([
        ApprovalAPI.getPendingApprovals(),
        ApprovalAPI.getApprovalChains(),
      ]);
      setPendingApprovals(approvals);
      setApprovalChains(chains);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalAction = async (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => {
    try {
      if (action === "approve") {
        await ApprovalAPI.approveExpense(expenseId, comment);
      } else {
        await ApprovalAPI.rejectExpense(expenseId, comment);
      }

      // Remove the processed expense from pending list
      setPendingApprovals((prev) =>
        prev.filter((expense) => expense.id !== expenseId)
      );

      // TODO: Show success toast notification
      console.log(`Expense ${expenseId} ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing expense:`, error);
      // TODO: Show error toast notification
    }
  };

  // Handlers for approval chains
  const handleCreateChain = () => {
    // TODO: Implement create chain dialog
    console.log("Create new approval chain");
  };

  const handleEditChain = (chain: ApprovalChain) => {
    // TODO: Implement edit chain dialog
    console.log("Edit approval chain:", chain);
  };

  const handleDeleteChain = async (chainId: number) => {
    try {
      await ApprovalAPI.deleteApprovalChain(chainId);
      setApprovalChains((prev) => prev.filter((chain) => chain.id !== chainId));
      console.log("Approval chain deleted successfully");
    } catch (error) {
      console.error("Error deleting approval chain:", error);
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
          <TabsTrigger value="chains">Approval Chains</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Escalation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <PendingApprovalsTab
            expenses={pendingApprovals}
            onApprovalAction={handleApprovalAction}
          />
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <ApprovalChainsTab
            chains={approvalChains}
            onCreateChain={handleCreateChain}
            onEditChain={handleEditChain}
            onDeleteChain={handleDeleteChain}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab
            settings={notificationSettings}
            onUpdateSettings={setNotificationSettings}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <EscalationSettingsTab
            settings={escalationSettings}
            onUpdateSettings={setEscalationSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
