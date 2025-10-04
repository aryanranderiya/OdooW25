import { 
  ApprovalAPI, 
  ExpenseApproval as BackendExpenseApproval, 
  ApprovalRule,
  ApprovalRuleType 
} from '@/lib/approval-api';
import { ExpenseApproval, ApprovalChain } from './types';

// Helper function to convert backend expense approval to frontend format
function convertExpenseApproval(backendApproval: BackendExpenseApproval): ExpenseApproval {
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
    receiptUrl: backendApproval.receiptUrl
  };
}

// Helper function to convert approval rule to approval chain format for UI compatibility
function convertApprovalRuleToChain(rule: ApprovalRule): ApprovalChain {
  return {
    id: parseInt(rule.id),
    name: rule.name,
    steps: rule.approvalSteps.map(step => ({
      order: step.sequence,
      role: step.approverName,
      escalationDays: 2 // Default escalation days - you may want to add this to the backend model
    })),
    conditions: rule.minAmount && rule.maxAmount 
      ? `Amount between $${rule.minAmount} - $${rule.maxAmount}` 
      : rule.minAmount 
        ? `Amount >= $${rule.minAmount}`
        : rule.maxAmount 
          ? `Amount <= $${rule.maxAmount}`
          : 'All amounts',
    active: rule.isActive
  };
}

// API functions - connected to backend
export class AdminApprovalAPI {
  static async getPendingApprovals(): Promise<ExpenseApproval[]> {
    try {
      const backendApprovals = await ApprovalAPI.getAllPendingApprovals();
      return backendApprovals.map(convertExpenseApproval);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  static async getApprovalChains(): Promise<ApprovalChain[]> {
    try {
      const rules = await ApprovalAPI.getApprovalRules();
      return rules.map(convertApprovalRuleToChain);
    } catch (error) {
      console.error('Error fetching approval chains:', error);
      throw error;
    }
  }

  static async approveExpense(expenseId: number, comment?: string): Promise<void> {
    try {
      await ApprovalAPI.approveExpense(expenseId.toString(), comment);
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  }

  static async rejectExpense(expenseId: number, comment: string): Promise<void> {
    try {
      await ApprovalAPI.rejectExpense(expenseId.toString(), comment);
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  }

  static async createApprovalChain(chain: Omit<ApprovalChain, 'id'>): Promise<ApprovalChain> {
    try {
      // Convert ApprovalChain to CreateApprovalRuleDto
      const ruleData = {
        name: chain.name,
        description: `Approval chain: ${chain.conditions}`,
        ruleType: ApprovalRuleType.SEQUENTIAL,
        approvalSteps: chain.steps.map(step => ({
          sequence: step.order,
          approverId: step.role, // This should be actual user ID in real implementation
          isRequired: true
        }))
      };

      const newRule = await ApprovalAPI.createApprovalRule(ruleData);
      return convertApprovalRuleToChain(newRule);
    } catch (error) {
      console.error('Error creating approval chain:', error);
      throw error;
    }
  }

  static async updateApprovalChain(chain: ApprovalChain): Promise<ApprovalChain> {
    try {
      const updateData = {
        name: chain.name,
        isActive: chain.active,
        description: `Approval chain: ${chain.conditions}`
      };

      const updatedRule = await ApprovalAPI.updateApprovalRule(chain.id.toString(), updateData);
      return convertApprovalRuleToChain(updatedRule);
    } catch (error) {
      console.error('Error updating approval chain:', error);
      throw error;
    }
  }

  static async deleteApprovalChain(chainId: number): Promise<void> {
    try {
      await ApprovalAPI.deleteApprovalRule(chainId.toString());
    } catch (error) {
      console.error('Error deleting approval chain:', error);
      throw error;
    }
  }

  // Additional admin-specific methods
  static async processEscalations(): Promise<void> {
    try {
      await ApprovalAPI.processEscalations();
    } catch (error) {
      console.error('Error processing escalations:', error);
      throw error;
    }
  }

  static async escalateApproval(requestId: string, newApproverId: string): Promise<void> {
    try {
      await ApprovalAPI.escalateApproval(requestId, newApproverId);
    } catch (error) {
      console.error('Error escalating approval:', error);
      throw error;
    }
  }
}
