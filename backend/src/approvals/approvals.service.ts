import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessApprovalDto, GetPendingApprovalsQueryDto } from './dto/approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  // Get pending approvals for a specific user (manager/admin)
  async getPendingApprovals(userId: string, query?: GetPendingApprovalsQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find approval requests where this user is the approver and status is pending
    const approvalRequests = await this.prisma.approvalRequest.findMany({
      where: {
        approverId: userId,
        status: 'PENDING',
        expense: {
          companyId: query?.companyId || user.companyId,
        },
      },
      include: {
        expense: {
          include: {
            submitter: {
              select: { id: true, name: true, email: true },
            },
            category: {
              select: { id: true, name: true },
            },
            receipts: true,
          },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return approvalRequests;
  }

  // Process approval (approve or reject)
  async processApproval(
    userId: string,
    expenseId: string,
    data: ProcessApprovalDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the approval request
    const approvalRequest = await this.prisma.approvalRequest.findFirst({
      where: {
        expenseId,
        approverId: userId,
        status: 'PENDING',
      },
      include: {
        expense: {
          include: {
            approvalRule: {
              include: {
                approvalSteps: {
                  include: {
                    approver: true,
                  },
                  orderBy: {
                    sequence: 'asc',
                  },
                },
              },
            },
            approvalRequests: {
              include: {
                approver: true,
              },
              orderBy: {
                stepNumber: 'asc',
              },
            },
          },
        },
      },
    });

    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found or already processed');
    }

    const expense = approvalRequest.expense;

    // Check if user has permission to approve this expense
    const canApprove = await this.canUserApprove(userId, expense);
    if (!canApprove) {
      throw new ForbiddenException('You do not have permission to approve this expense');
    }

    // Process the approval in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the approval request
      const updatedRequest = await tx.approvalRequest.update({
        where: { id: approvalRequest.id },
        data: {
          status: data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          comment: data.comment,
          actionDate: new Date(),
        },
      });

      if (data.action === 'REJECT') {
        // If rejected, update expense status to rejected
        await tx.expense.update({
          where: { id: expenseId },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date(),
          },
        });
        return { success: true, status: 'REJECTED' };
      }

      // If approved, check if this completes the approval workflow
      const isCompleted = await this.checkApprovalCompletion(tx, expense, updatedRequest);
      
      if (isCompleted) {
        await tx.expense.update({
          where: { id: expenseId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        });
        return { success: true, status: 'APPROVED' };
      }

      return { success: true, status: 'PENDING_APPROVAL' };
    });

    return result;
  }

  // Check if user can approve an expense
  private async canUserApprove(userId: string, expense: any): Promise<boolean> {
    // Check if user is the direct manager of the submitter
    const submitter = await this.prisma.user.findUnique({
      where: { id: expense.submitterId },
    });

    if (submitter?.managerId === userId) {
      return true;
    }

    // Check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === 'ADMIN') {
      return true;
    }

    // Check if user is specifically assigned as an approver in the approval rule
    if (expense.approvalRule) {
      const approvalStep = expense.approvalRule.approvalSteps.find(
        (step: any) => step.approverId === userId
      );
      return !!approvalStep;
    }

    return false;
  }

  // Check if approval workflow is completed
  private async checkApprovalCompletion(tx: any, expense: any, currentRequest: any): Promise<boolean> {
    if (!expense.approvalRule) {
      // Simple manager approval - if current request is approved, we're done
      return currentRequest.status === 'APPROVED';
    }

    const rule = expense.approvalRule;
    
    // Get all approval requests for this expense
    const allRequests = await tx.approvalRequest.findMany({
      where: { expenseId: expense.id },
      include: { approver: true },
    });

    switch (rule.ruleType) {
      case 'SEQUENTIAL':
        // For sequential approval, check if we need to create next step
        if (currentRequest.status === 'APPROVED') {
          await this.createNextSequentialStep(tx, expense, rule, allRequests);
        }
        
        // Check if all steps are completed in order
        const approvedSteps = allRequests.filter(req => req.status === 'APPROVED').length;
        const totalSteps = rule.approvalSteps.length + (rule.requireManagerFirst ? 1 : 0);
        return approvedSteps >= totalSteps;

      case 'PERCENTAGE':
        // Check if percentage threshold is met
        const totalApprovers = rule.approvalSteps.length;
        const approvedCount = allRequests.filter(req => req.status === 'APPROVED').length;
        const percentage = (approvedCount / totalApprovers) * 100;
        return percentage >= (rule.percentageThreshold || 50);

      case 'SPECIFIC_APPROVER':
        // Check if specific approver has approved
        const specificApproval = allRequests.find(
          req => req.approverId === rule.specificApproverId && req.status === 'APPROVED'
        );
        return !!specificApproval;

      case 'HYBRID':
        // Check both percentage and specific approver conditions
        const hybridPercentage = allRequests.filter(req => req.status === 'APPROVED').length / rule.approvalSteps.length * 100;
        const hybridSpecificApproval = allRequests.find(
          req => req.approverId === rule.specificApproverId && req.status === 'APPROVED'
        );
        
        return (hybridPercentage >= (rule.percentageThreshold || 50)) || !!hybridSpecificApproval;

      default:
        return false;
    }
  }

  // Create next sequential approval step
  private async createNextSequentialStep(tx: any, expense: any, rule: any, currentRequests: any[]) {
    const approvedRequests = currentRequests.filter(req => req.status === 'APPROVED');
    
    // Find the next step that hasn't been created yet
    let nextStepNumber = 1;
    if (rule.requireManagerFirst) {
      nextStepNumber = approvedRequests.length; // Manager is step 0, so next is 1, 2, etc.
    } else {
      nextStepNumber = approvedRequests.length + 1;
    }

    // Check if there's a next step to create
    const nextStep = rule.approvalSteps.find((step: any) => step.sequence === nextStepNumber);
    
    if (nextStep) {
      // Check if this step hasn't already been created
      const existingRequest = currentRequests.find(req => req.stepNumber === nextStepNumber);
      
      if (!existingRequest) {
        await tx.approvalRequest.create({
          data: {
            expenseId: expense.id,
            approverId: nextStep.approverId,
            stepNumber: nextStepNumber,
            status: 'PENDING',
          },
        });
      }
    }
  }

  // Get all expenses that need approval (for admins)
  async getAllPendingApprovals(userId: string, companyId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all pending approvals');
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        status: 'PENDING_APPROVAL',
        companyId: companyId || user.companyId,
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        approvalRequests: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: {
            stepNumber: 'asc',
          },
        },
        receipts: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return expenses;
  }
}
