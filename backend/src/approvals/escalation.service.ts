import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EscalationService {
  constructor(private prisma: PrismaService) {}

  // Process escalations (can be called manually or via scheduled job)
  async processEscalations() {
    console.log('Running escalation check...');
    
    // Find approval requests that are pending and past their escalation time
    const overdueRequests = await this.prisma.approvalRequest.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago (configurable)
        },
      },
      include: {
        expense: {
          include: {
            submitter: {
              select: { id: true, name: true, email: true, managerId: true },
            },
            approvalRule: {
              include: {
                approvalSteps: {
                  include: {
                    approver: {
                      select: { id: true, name: true, email: true, managerId: true },
                    },
                  },
                  orderBy: {
                    sequence: 'asc',
                  },
                },
              },
            },
          },
        },
        approver: {
          select: { id: true, name: true, email: true, managerId: true },
        },
      },
    });

    for (const request of overdueRequests) {
      await this.escalateApproval(request);
    }
  }

  private async escalateApproval(request: any) {
    const { expense, approver } = request;

    // Find the next escalation approver (usually the approver's manager)
    let escalationApproverId = approver.managerId;

    // If no manager, escalate to admin
    if (!escalationApproverId) {
      const admin = await this.prisma.user.findFirst({
        where: {
          role: 'ADMIN',
          companyId: expense.submitter.companyId || expense.company?.id,
        },
      });
      escalationApproverId = admin?.id;
    }

    if (!escalationApproverId) {
      console.log(`No escalation target found for approval request ${request.id}`);
      return;
    }

    // Create escalated approval request
    await this.prisma.approvalRequest.create({
      data: {
        expenseId: expense.id,
        approverId: escalationApproverId,
        stepNumber: request.stepNumber + 100, // Use higher step number to indicate escalation
        status: 'PENDING',
        comment: `Escalated from ${approver.name} due to timeout`,
      },
    });

    // Mark original request as escalated (we can add this status to enum if needed)
    await this.prisma.approvalRequest.update({
      where: { id: request.id },
      data: {
        comment: `Escalated to ${escalationApproverId} on ${new Date().toISOString()}`,
      },
    });

    console.log(`Escalated approval request ${request.id} to ${escalationApproverId}`);
  }

  // Manual escalation (for admins)
  async manualEscalation(adminId: string, approvalRequestId: string, newApproverId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Only admins can manually escalate approvals');
    }

    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId },
      include: {
        expense: true,
        approver: true,
      },
    });

    if (!request || request.status !== 'PENDING') {
      throw new Error('Approval request not found or not pending');
    }

    // Create new escalated request
    const escalatedRequest = await this.prisma.approvalRequest.create({
      data: {
        expenseId: request.expense.id,
        approverId: newApproverId,
        stepNumber: request.stepNumber + 100,
        status: 'PENDING',
        comment: `Manually escalated by admin ${admin.name}`,
      },
    });

    // Mark original as escalated
    await this.prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        comment: `Manually escalated by ${admin.name} on ${new Date().toISOString()}`,
      },
    });

    return escalatedRequest;
  }
}
