import { api } from "./api-client";

// Backend DTOs and Types
export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum ApprovalRuleType {
  SEQUENTIAL = 'SEQUENTIAL',
  PERCENTAGE = 'PERCENTAGE', 
  SPECIFIC_APPROVER = 'SPECIFIC_APPROVER',
  HYBRID = 'HYBRID',
}

export interface ProcessApprovalDto {
  action: ApprovalAction;
  comment?: string;
}

export interface GetPendingApprovalsQueryDto {
  companyId?: string;
  status?: string;
}

export interface CreateApprovalRuleDto {
  name: string;
  description?: string;
  ruleType: ApprovalRuleType;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst?: boolean;
  approvalSteps: CreateApprovalStepDto[];
}

export interface CreateApprovalStepDto {
  sequence: number;
  approverId: string;
  isRequired?: boolean;
}

export interface UpdateApprovalRuleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst?: boolean;
}

// Frontend Types (mapped from backend responses)
export interface ExpenseApproval {
  id: string;
  expenseId: string;
  employeeName: string;
  employeeAvatar?: string;
  expenseTitle: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high';
  submittedAt: string;
  description: string;
  receiptUrl?: string;
  currentApproverId: string;
  approvalChainId: string;
  comments?: ApprovalComment[];
}

export interface ApprovalComment {
  id: string;
  approverId: string;
  approverName: string;
  action: ApprovalAction;
  comment?: string;
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  ruleType: ApprovalRuleType;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst?: boolean;
  isActive: boolean;
  approvalSteps: ApprovalStep[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  sequence: number;
  approverId: string;
  approverName: string;
  approverEmail: string;
  isRequired: boolean;
}

// Approval API Service
export class ApprovalAPI {
  // ===== APPROVAL PROCESSING =====
  
  /**
   * Get pending approvals for current user
   */
  static async getPendingApprovals(query?: GetPendingApprovalsQueryDto): Promise<ExpenseApproval[]> {
    try {
      const response = await api.get('/approvals/pending', { params: query });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  /**
   * Get all pending approvals (admin only)
   */
  static async getAllPendingApprovals(companyId?: string): Promise<ExpenseApproval[]> {
    try {
      const response = await api.get('/approvals/all-pending', { 
        params: companyId ? { companyId } : undefined 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all pending approvals:', error);
      throw error;
    }
  }

  /**
   * Process approval (approve or reject an expense)
   */
  static async processApproval(
    expenseId: string, 
    data: ProcessApprovalDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/approvals/expenses/${expenseId}/process`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing approval:', error);
      throw error;
    }
  }

  /**
   * Approve expense (convenience method)
   */
  static async approveExpense(expenseId: string, comment?: string): Promise<void> {
    await this.processApproval(expenseId, {
      action: ApprovalAction.APPROVE,
      comment
    });
  }

  /**
   * Reject expense (convenience method)
   */
  static async rejectExpense(expenseId: string, comment: string): Promise<void> {
    await this.processApproval(expenseId, {
      action: ApprovalAction.REJECT,
      comment
    });
  }

  /**
   * Manual escalation (Admin only)
   */
  static async escalateApproval(requestId: string, newApproverId: string): Promise<void> {
    try {
      await api.post(`/approvals/requests/${requestId}/escalate`, { newApproverId });
    } catch (error) {
      console.error('Error escalating approval:', error);
      throw error;
    }
  }

  /**
   * Process all escalations (Admin only)
   */
  static async processEscalations(): Promise<void> {
    try {
      await api.post('/approvals/process-escalations');
    } catch (error) {
      console.error('Error processing escalations:', error);
      throw error;
    }
  }

  // ===== APPROVAL RULES MANAGEMENT =====

  /**
   * Create new approval rule (Admin only)
   */
  static async createApprovalRule(data: CreateApprovalRuleDto): Promise<ApprovalRule> {
    try {
      const response = await api.post('/approval-rules', data);
      return response.data;
    } catch (error) {
      console.error('Error creating approval rule:', error);
      throw error;
    }
  }

  /**
   * Get all approval rules
   */
  static async getApprovalRules(): Promise<ApprovalRule[]> {
    try {
      const response = await api.get('/approval-rules');
      return response.data;
    } catch (error) {
      console.error('Error fetching approval rules:', error);
      throw error;
    }
  }

  /**
   * Get specific approval rule
   */
  static async getApprovalRule(id: string): Promise<ApprovalRule> {
    try {
      const response = await api.get(`/approval-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approval rule:', error);
      throw error;
    }
  }

  /**
   * Update approval rule (Admin only)
   */
  static async updateApprovalRule(id: string, data: UpdateApprovalRuleDto): Promise<ApprovalRule> {
    try {
      const response = await api.put(`/approval-rules/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating approval rule:', error);
      throw error;
    }
  }

  /**
   * Delete approval rule (Admin only)
   */
  static async deleteApprovalRule(id: string): Promise<void> {
    try {
      await api.delete(`/approval-rules/${id}`);
    } catch (error) {
      console.error('Error deleting approval rule:', error);
      throw error;
    }
  }
}

// Export both the class and individual functions for flexibility
export const {
  getPendingApprovals,
  getAllPendingApprovals,
  processApproval,
  approveExpense,
  rejectExpense,
  escalateApproval,
  processEscalations,
  createApprovalRule,
  getApprovalRules,
  getApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
} = ApprovalAPI;
