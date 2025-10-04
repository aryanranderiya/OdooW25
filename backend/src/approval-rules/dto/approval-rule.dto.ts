export enum ApprovalRuleType {
  SEQUENTIAL = 'SEQUENTIAL',
  PERCENTAGE = 'PERCENTAGE', 
  SPECIFIC_APPROVER = 'SPECIFIC_APPROVER',
  HYBRID = 'HYBRID',
}

export class CreateApprovalRuleDto {
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

export class CreateApprovalStepDto {
  sequence: number;
  approverId: string;
  isRequired?: boolean;
}

export class UpdateApprovalRuleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  percentageThreshold?: number;
  specificApproverId?: string;
  requireManagerFirst?: boolean;
}
