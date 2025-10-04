import { api } from "./api-client";

export enum ApprovalRuleType {
  SEQUENTIAL = "SEQUENTIAL",
  PERCENTAGE = "PERCENTAGE",
  SPECIFIC_APPROVER = "SPECIFIC_APPROVER",
  HYBRID = "HYBRID",
}

export interface ApprovalStep {
  sequence: number;
  approverId: string;
  isRequired?: boolean;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  ruleType: ApprovalRuleType;
  isActive: boolean;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst: boolean;
  approvalSteps: Array<{
    id: string;
    sequence: number;
    approverId: string;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    isRequired: boolean;
  }>;
  specificApprover?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateApprovalRuleDto {
  name: string;
  description?: string;
  ruleType: ApprovalRuleType;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst?: boolean;
  approvalSteps?: ApprovalStep[];
}

export interface PendingApproval {
  id: string;
  stepNumber: number;
  status: string;
  comment?: string;
  actionDate?: string;
  expense: {
    id: string;
    title: string;
    description?: string;
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    companyCurrency: string;
    expenseDate: string;
    status: string;
    submittedAt: string;
    submitter: {
      id: string;
      name: string;
      email: string;
    };
    category?: {
      id: string;
      name: string;
    };
    receipts: any[];
    approvalActions: Array<{
      id: string;
      status: string;
      comment?: string;
      createdAt: string;
      approver: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }>;
  };
}

export const approvalApi = {
  async createRule(data: CreateApprovalRuleDto): Promise<ApprovalRule> {
    const response = await api.post("/approvals/rules", data);
    return response.data;
  },

  async getRules(): Promise<ApprovalRule[]> {
    const response = await api.get("/approvals/rules");
    return response.data;
  },

  async updateRule(
    id: string,
    data: Partial<CreateApprovalRuleDto>
  ): Promise<ApprovalRule> {
    const response = await api.patch(`/approvals/rules/${id}`, data);
    return response.data;
  },

  async deleteRule(id: string): Promise<void> {
    await api.delete(`/approvals/rules/${id}`);
  },

  async getPendingApprovals(): Promise<PendingApproval[]> {
    const response = await api.get("/approvals/pending");
    return response.data;
  },

  async approveExpense(expenseId: string, comment?: string): Promise<void> {
    await api.post(`/approvals/${expenseId}/approve`, { comment });
  },

  async rejectExpense(expenseId: string, comment: string): Promise<void> {
    await api.post(`/approvals/${expenseId}/reject`, { comment });
  },
};
