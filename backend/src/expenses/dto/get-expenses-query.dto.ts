export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface GetExpensesQueryDto {
  status?: ExpenseStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
