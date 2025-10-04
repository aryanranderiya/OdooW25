// Main components
export { PendingApprovalsTab } from './pending-approvals-tab';
export { ApprovalChainsTab } from './approval-chains-tab';
export { NotificationsTab } from './notifications-tab';
export { EscalationSettingsTab } from './escalation-settings-tab';

// Sub-components
export { PendingApprovalsTable } from './pending-approvals-table';
export { ApprovalChainCard } from './approval-chain-card';
export { ExpenseDetailsDialog } from './expense-details-dialog';
export { ApprovalActionDialog } from './approval-action-dialog';
export { PriorityBadge } from './priority-badge';

// Types and utilities
export * from './types';
export * from './utils';
export { ApprovalAPI } from './api';
export { mockExpenseApprovals, mockApprovalChains } from './api';
