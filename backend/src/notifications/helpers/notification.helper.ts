import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../dto/create-notification.dto';

export class NotificationHelper {
  constructor(private notificationsService: NotificationsService) {}

  async notifyExpenseSubmitted(
    submitterId: string,
    approverId: string,
    expenseTitle: string,
    expenseId: string,
  ) {
    await this.notificationsService.createNotification({
      userId: approverId,
      type: NotificationType.APPROVAL_REQUEST,
      title: 'New Expense to Review',
      message: `${expenseTitle} has been submitted for your approval`,
      metadata: { expenseId, submitterId },
    });

    await this.notificationsService.createNotification({
      userId: submitterId,
      type: NotificationType.EXPENSE_SUBMITTED,
      title: 'Expense Submitted',
      message: `Your expense "${expenseTitle}" has been submitted for approval`,
      metadata: { expenseId },
    });
  }

  async notifyExpenseApproved(
    submitterId: string,
    approverId: string,
    approverName: string,
    expenseTitle: string,
    expenseId: string,
  ) {
    await this.notificationsService.createNotification({
      userId: submitterId,
      type: NotificationType.EXPENSE_APPROVED,
      title: 'Expense Approved',
      message: `Your expense "${expenseTitle}" has been approved by ${approverName}`,
      metadata: { expenseId, approverId },
    });
  }

  async notifyExpenseRejected(
    submitterId: string,
    approverId: string,
    approverName: string,
    expenseTitle: string,
    expenseId: string,
    reason?: string,
  ) {
    await this.notificationsService.createNotification({
      userId: submitterId,
      type: NotificationType.EXPENSE_REJECTED,
      title: 'Expense Rejected',
      message: `Your expense "${expenseTitle}" has been rejected by ${approverName}${reason ? `: ${reason}` : ''}`,
      metadata: { expenseId, approverId, reason },
    });
  }

  async notifyExpenseUpdated(
    relevantUserIds: string[],
    expenseTitle: string,
    expenseId: string,
    changeDescription: string,
  ) {
    for (const userId of relevantUserIds) {
      await this.notificationsService.createNotification({
        userId,
        type: NotificationType.EXPENSE_UPDATED,
        title: 'Expense Updated',
        message: `${expenseTitle}: ${changeDescription}`,
        metadata: { expenseId },
      });
    }
  }

  async notifySystem(
    userId: string,
    title: string,
    message: string,
    metadata?: any,
  ) {
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title,
      message,
      metadata,
    });
  }
}
