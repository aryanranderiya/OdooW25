export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ProcessApprovalDto {
  action: ApprovalAction;
  comment?: string;
}

export class GetPendingApprovalsQueryDto {
  companyId?: string;
  status?: string;
}
