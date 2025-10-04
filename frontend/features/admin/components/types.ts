// Types for the approval workflow system (frontend display)
export interface ExpenseApproval {
  id: number;
  employeeName: string;
  employeeAvatar?: string;
  expenseTitle: string;
  amount: string; // Formatted string for display
  currency: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high';
  submittedAt: string;
  description: string;
  receiptUrl?: string;
}

export interface ApprovalStep {
  order: number;
  role: string;
  escalationDays: number;
}

export interface ApprovalChain {
  id: number;
  name: string;
  steps: ApprovalStep[];
  conditions: string;
  active: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  escalationReminders: boolean;
}

export interface EscalationSettings {
  defaultEscalationDays: number;
  maxEscalationLevels: number | 'unlimited';
  weekendEscalation: boolean;
  autoApproveOnFinalEscalation: boolean;
}

export type ApprovalAction = 'approve' | 'reject';

export interface ApprovalActionData {
  expenseId: number;
  action: ApprovalAction;
  comment?: string;
}
