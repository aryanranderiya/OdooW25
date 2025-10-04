"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import {
  PendingApprovalsTab,
  ApprovalChainsTab,
  NotificationsTab,
  EscalationSettingsTab,
  AdminApprovalAPI,
  ExpenseApproval,
  ApprovalChain,
  ApprovalAction,
  NotificationSettings,
  EscalationSettings,
} from "@/features/admin/components";
import { useApprovals, useApprovalData } from "@/hooks/use-approvals";
import { ExpenseApproval as BackendExpenseApproval } from "@/lib/approval-api";
import { APIConnectionTest } from "@/components/api-connection-test";

// Helper function to convert backend expense approval to frontend format
function convertBackendToFrontend(
  backendApproval: BackendExpenseApproval
): ExpenseApproval {
  return {
    id: parseInt(backendApproval.id),
    employeeName: backendApproval.employeeName,
    employeeAvatar: backendApproval.employeeAvatar,
    expenseTitle: backendApproval.expenseTitle,
    amount: `$${backendApproval.amount.toFixed(2)}`,
    currency: backendApproval.currency,
    category: backendApproval.category,
    date: backendApproval.date,
    status: backendApproval.status,
    priority: backendApproval.priority,
    submittedAt: backendApproval.submittedAt,
    description: backendApproval.description,
    receiptUrl: backendApproval.receiptUrl,
  };
}

export default function Page() {
  // Use custom hooks for approval operations
  const {
    approveExpense,
    rejectExpense,
    isLoading: isProcessing,
    error: processingError,
    clearError,
  } = useApprovals();
  const {
    pendingApprovals: backendPendingApprovals,
    isLoading,
    error: dataError,
    refreshData,
    setPendingApprovals,
  } = useApprovalData();

  // State for converted frontend data
  const [frontendPendingApprovals, setFrontendPendingApprovals] = useState<
    ExpenseApproval[]
  >([]);

  // State for approval chains (using mock data for now until backend is ready)
  const [approvalChains, setApprovalChains] = useState<ApprovalChain[]>([]);

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

  // Convert backend data to frontend format
  useEffect(() => {
    const convertedApprovals = backendPendingApprovals.map(
      convertBackendToFrontend
    );
    setFrontendPendingApprovals(convertedApprovals);
  }, [backendPendingApprovals]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await refreshData(true); // true for admin - get all pending approvals

    // Load approval chains
    try {
      const chains = await AdminApprovalAPI.getApprovalChains();
      setApprovalChains(chains);
    } catch (error) {
      console.error("Error loading approval chains:", error);
    }
  };

  const handleApprovalAction = async (
    expenseId: number,
    action: ApprovalAction,
    comment: string
  ) => {
    const expenseIdStr = expenseId.toString();
    let success = false;

    try {
      if (action === "approve") {
        success = await approveExpense(expenseIdStr, comment);
      } else {
        success = await rejectExpense(expenseIdStr, comment);
      }

      if (success) {
        // Remove the processed expense from both frontend and backend lists
        setFrontendPendingApprovals((prev) =>
          prev.filter((expense) => expense.id !== expenseId)
        );
        setPendingApprovals((prev) =>
          prev.filter((expense) => expense.id !== expenseIdStr)
        );
        console.log(`Expense ${expenseId} ${action}d successfully`);
      }
    } catch (error) {
      console.error(`Error ${action}ing expense:`, error);
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
      await AdminApprovalAPI.deleteApprovalChain(chainId);
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
        <APIConnectionTest />
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({frontendPendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="chains">Approval Chains</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Escalation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {(processingError || dataError) && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>
                {processingError || dataError}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearError();
                    loadData();
                  }}
                  className="ml-2"
                >
                  <IconRefresh className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <PendingApprovalsTab
            expenses={frontendPendingApprovals}
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
