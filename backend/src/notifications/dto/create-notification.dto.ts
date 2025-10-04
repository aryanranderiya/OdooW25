export enum NotificationType {
  EXPENSE_SUBMITTED = 'EXPENSE_SUBMITTED',
  EXPENSE_APPROVED = 'EXPENSE_APPROVED',
  EXPENSE_REJECTED = 'EXPENSE_REJECTED',
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  EXPENSE_UPDATED = 'EXPENSE_UPDATED',
  SYSTEM = 'SYSTEM',
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}
