import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApprovalStatus,
  ExpenseStatus,
  ApprovalRuleType,
} from '@prisma/client';
import {
  CreateApprovalRuleDto,
  UpdateApprovalRuleDto,
} from './dto/approval.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async createApprovalRule(createDto: CreateApprovalRuleDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const companyId = user.companyId;

    const approvalSteps =
      createDto.approvalSteps?.map((step) => ({
        sequence: step.sequence,
        approverId: step.approverId,
        isRequired: step.isRequired ?? true,
      })) || [];

    const approvalRule = await this.prisma.approvalRule.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        ruleType: createDto.ruleType,
        isActive: createDto.isActive ?? true,
        companyId,
        minAmount: createDto.minAmount,
        maxAmount: createDto.maxAmount,
        percentageThreshold: createDto.percentageThreshold,
        specificApproverId: createDto.specificApproverId,
        requireManagerFirst: createDto.requireManagerFirst ?? false,
        approvalSteps: {
          create: approvalSteps,
        },
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
    });

    return approvalRule;
  }

  async findAllRules(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.approvalRule.findMany({
      where: { companyId: user.companyId },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { sequence: 'asc' },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApprovalRule(
    ruleId: string,
    updateDto: UpdateApprovalRuleDto,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rule = await this.prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId: user.companyId },
    });

    if (!rule) {
      throw new NotFoundException('Approval rule not found');
    }

    if (updateDto.approvalSteps) {
      await this.prisma.approvalStep.deleteMany({
        where: { approvalRuleId: ruleId },
      });
    }

    return this.prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        name: updateDto.name,
        description: updateDto.description,
        isActive: updateDto.isActive,
        minAmount: updateDto.minAmount,
        maxAmount: updateDto.maxAmount,
        percentageThreshold: updateDto.percentageThreshold,
        specificApproverId: updateDto.specificApproverId,
        requireManagerFirst: updateDto.requireManagerFirst,
        approvalSteps: updateDto.approvalSteps
          ? {
              create: updateDto.approvalSteps.map((step) => ({
                sequence: step.sequence,
                approverId: step.approverId,
                isRequired: step.isRequired ?? true,
              })),
            }
          : undefined,
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { sequence: 'asc' },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async deleteApprovalRule(ruleId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rule = await this.prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId: user.companyId },
    });

    if (!rule) {
      throw new NotFoundException('Approval rule not found');
    }

    await this.prisma.approvalRule.delete({
      where: { id: ruleId },
    });

    return { message: 'Approval rule deleted successfully' };
  }

  async getPendingApprovals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all active approval rules for the company
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: {
        companyId: user.companyId,
        isActive: true,
      },
    });

    // Get all pending expenses in the company
    const pendingExpenses = await this.prisma.expense.findMany({
      where: {
        companyId: user.companyId,
        status: ExpenseStatus.PENDING_APPROVAL,
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true, managerId: true },
        },
        category: {
          select: { id: true, name: true },
        },
        receipts: true,
        approvalActions: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Calculate which expenses this user can approve
    const approvableExpenses: any[] = [];

    for (const expense of pendingExpenses) {
      // Check if user already approved or rejected this expense
      const existingAction = expense.approvalActions.find(
        (action: any) => action.approverId === userId,
      );
      if (existingAction) continue;

      // Check against ALL approval rules to see if user can approve
      const canApprove = await this.canUserApproveExpense(
        userId,
        expense,
        approvalRules,
        user.companyId,
      );

      if (canApprove) {
        approvableExpenses.push({
          id: `pending-${expense.id}-${userId}`,
          expenseId: expense.id,
          approverId: userId,
          expense,
          canApprove: true,
        });
      }
    }

    return approvableExpenses;
  }

  private async canUserApproveExpense(
    userId: string,
    expense: any,
    approvalRules: any[],
    companyId: string,
  ): Promise<boolean> {
    // Check expense amount against ALL approval rules
    const matchingRules = this.findMatchingRules(expense, approvalRules);

    if (matchingRules.length === 0) return false;

    // Check if user can approve under ANY of the matching rules
    for (const rule of matchingRules) {
      let canApprove = false;

      switch (rule.ruleType) {
        case ApprovalRuleType.PERCENTAGE:
          canApprove = await this.canApprovePercentage(userId, rule);
          break;

        case ApprovalRuleType.SPECIFIC_APPROVER:
          canApprove = rule.specificApproverId === userId;
          break;

        case ApprovalRuleType.SEQUENTIAL:
          canApprove = await this.canApproveSequential(userId, expense);
          break;

        case ApprovalRuleType.HYBRID:
          canApprove = await this.canApproveHybrid(
            userId,
            expense,
            companyId,
            rule,
          );
          break;
      }

      if (canApprove) return true;
    }

    return false;
  }

  private findMatchingRules(expense: any, approvalRules: any[]): any[] {
    const amount = expense.convertedAmount;

    return approvalRules.filter((rule) => {
      if (rule.minAmount !== null && amount < rule.minAmount) return false;
      if (rule.maxAmount !== null && amount > rule.maxAmount) return false;
      return true;
    });
  }

  private async canApprovePercentage(
    userId: string,
    rule: any,
  ): Promise<boolean> {
    // Get the rule with its approval steps
    const ruleWithSteps = await this.prisma.approvalRule.findUnique({
      where: { id: rule.id },
      include: {
        approvalSteps: true,
      },
    });

    // If rule has approval steps defined, check if user is in those steps
    if (
      ruleWithSteps?.approvalSteps &&
      ruleWithSteps.approvalSteps.length > 0
    ) {
      return ruleWithSteps.approvalSteps.some(
        (step) => step.approverId === userId,
      );
    }

    // Otherwise, fall back to checking if user is a manager approver
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isManagerApprover: true },
    });

    return user?.isManagerApprover === true;
  }

  private async canApproveSequential(
    userId: string,
    expense: any,
  ): Promise<boolean> {
    // Build the manager hierarchy for this expense
    const managerChain = await this.buildManagerHierarchy(expense.submitter.id);

    // Find user's position in the chain
    const userIndex = managerChain.findIndex((id) => id === userId);
    if (userIndex === -1) return false;

    // Check if all previous managers have approved
    for (let i = 0; i < userIndex; i++) {
      const previousManagerId = managerChain[i];
      const hasApproved = expense.approvalActions.some(
        (action: any) =>
          action.approverId === previousManagerId &&
          action.status === ApprovalStatus.APPROVED,
      );

      if (!hasApproved) return false;
    }

    return true;
  }

  private async canApproveHybrid(
    userId: string,
    expense: any,
    companyId: string,
    rule: any,
  ): Promise<boolean> {
    // If user is the specific approver
    if (rule.specificApproverId === userId) {
      // Check if percentage threshold is met
      const percentageMet = await this.isPercentageThresholdMet(expense, rule);
      return percentageMet;
    }

    // Otherwise, check as percentage approver
    return await this.canApprovePercentage(userId, rule);
  }

  private async isPercentageThresholdMet(
    expense: any,
    rule: any,
  ): Promise<boolean> {
    // Get the rule with its approval steps
    const ruleWithSteps = await this.prisma.approvalRule.findUnique({
      where: { id: rule.id },
      include: {
        approvalSteps: true,
      },
    });

    const approvedCount = expense.approvalActions.filter(
      (action: any) => action.status === ApprovalStatus.APPROVED,
    ).length;

    let totalApprovers: number;

    // If rule has approval steps, use those as the total count
    if (
      ruleWithSteps?.approvalSteps &&
      ruleWithSteps.approvalSteps.length > 0
    ) {
      totalApprovers = ruleWithSteps.approvalSteps.length;
    } else {
      // Otherwise, use manager approvers count
      const approverManagers = await this.getApproverManagers(
        expense.companyId,
      );
      totalApprovers = approverManagers.length;
    }

    if (totalApprovers === 0) return false;

    const approvalPercentage = (approvedCount / totalApprovers) * 100;
    return approvalPercentage >= (rule.percentageThreshold || 0);
  }

  async approveExpense(expenseId: string, userId: string, comment?: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        submitter: {
          select: { id: true, name: true, email: true, managerId: true },
        },
        approvalRule: true,
        approvalActions: {
          include: {
            approver: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Expense is not pending approval');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Get all approval rules
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: {
        companyId: user!.companyId,
        isActive: true,
      },
    });

    // Check if user can approve
    const canApprove = await this.canUserApproveExpense(
      userId,
      expense,
      approvalRules,
      user!.companyId,
    );

    if (!canApprove) {
      throw new BadRequestException(
        'You are not authorized to approve this expense at this time',
      );
    }

    // Record the approval action
    await this.prisma.approvalAction.create({
      data: {
        expenseId,
        approverId: userId,
        status: ApprovalStatus.APPROVED,
        comment,
      },
    });

    // Check if expense satisfies ANY approval rule now
    const shouldApprove = await this.shouldExpenseBeApproved(
      expenseId,
      approvalRules,
    );

    if (shouldApprove) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: {
          status: ExpenseStatus.APPROVED,
          approvedAt: new Date(),
        },
      });

      // Notify submitter
      await this.notificationsService.createNotification({
        userId: expense.submitterId,
        type: NotificationType.EXPENSE_APPROVED,
        title: 'Expense Approved',
        message: `Your expense "${expense.title}" has been approved`,
        metadata: {
          expenseId: expense.id,
          expenseTitle: expense.title,
        },
      });

      return {
        message: 'Expense approved successfully',
        expenseStatus: 'APPROVED',
      };
    }

    return {
      message: 'Approval recorded',
      expenseStatus: 'PENDING_APPROVAL',
    };
  }

  async rejectExpense(expenseId: string, userId: string, comment: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        submitter: {
          select: { id: true, name: true, managerId: true },
        },
        approvalRule: true,
        approvalActions: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Expense is not pending approval');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Get all approval rules
    const approvalRules = await this.prisma.approvalRule.findMany({
      where: {
        companyId: user!.companyId,
        isActive: true,
      },
    });

    // Check if user can reject
    const canReject = await this.canUserApproveExpense(
      userId,
      expense,
      approvalRules,
      user!.companyId,
    );

    if (!canReject) {
      throw new BadRequestException(
        'You are not authorized to reject this expense at this time',
      );
    }

    // Record the rejection action
    await this.prisma.approvalAction.create({
      data: {
        expenseId,
        approverId: userId,
        status: ApprovalStatus.REJECTED,
        comment,
      },
    });

    // Mark expense as rejected
    await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });

    // Notify submitter
    await this.notificationsService.createNotification({
      userId: expense.submitterId,
      type: NotificationType.EXPENSE_REJECTED,
      title: 'Expense Rejected',
      message: `Your expense "${expense.title}" has been rejected`,
      metadata: {
        expenseId: expense.id,
        expenseTitle: expense.title,
        rejectionReason: comment,
      },
    });

    return { message: 'Expense rejected successfully' };
  }

  private async shouldExpenseBeApproved(
    expenseId: string,
    approvalRules: any[],
  ): Promise<boolean> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        submitter: {
          select: { id: true, managerId: true },
        },
        approvalActions: {
          where: { status: ApprovalStatus.APPROVED },
        },
      },
    });

    if (!expense) return false;

    // Check if expense satisfies ANY of the approval rules
    const matchingRules = this.findMatchingRules(expense, approvalRules);

    for (const rule of matchingRules) {
      const satisfiesRule = await this.checkIfExpenseSatisfiesRule(
        expense,
        rule,
      );
      if (satisfiesRule) {
        return true; // If ANY rule is satisfied, approve the expense
      }
    }

    return false;
  }

  private async checkIfExpenseSatisfiesRule(
    expense: any,
    rule: any,
  ): Promise<boolean> {
    const approvedCount = expense.approvalActions.length;

    switch (rule.ruleType) {
      case ApprovalRuleType.SEQUENTIAL: {
        const managerChain = await this.buildManagerHierarchy(
          expense.submitter.id,
        );
        return approvedCount >= managerChain.length;
      }

      case ApprovalRuleType.PERCENTAGE: {
        // Get the rule with its approval steps
        const ruleWithSteps = await this.prisma.approvalRule.findUnique({
          where: { id: rule.id },
          include: {
            approvalSteps: true,
          },
        });

        let totalApprovers: number;

        // If rule has approval steps, use those as the total count
        if (
          ruleWithSteps?.approvalSteps &&
          ruleWithSteps.approvalSteps.length > 0
        ) {
          totalApprovers = ruleWithSteps.approvalSteps.length;
        } else {
          // Otherwise, use manager approvers count
          const approverManagers = await this.getApproverManagers(
            expense.companyId,
          );
          totalApprovers = approverManagers.length;
        }

        if (totalApprovers === 0) return false;

        const approvalPercentage = (approvedCount / totalApprovers) * 100;
        return approvalPercentage >= (rule.percentageThreshold || 0);
      }

      case ApprovalRuleType.SPECIFIC_APPROVER:
        return expense.approvalActions.some(
          (action: any) => action.approverId === rule.specificApproverId,
        );

      case ApprovalRuleType.HYBRID: {
        // Get the rule with its approval steps
        const ruleWithSteps = await this.prisma.approvalRule.findUnique({
          where: { id: rule.id },
          include: {
            approvalSteps: true,
          },
        });

        let totalApprovers: number;

        // If rule has approval steps, use those as the total count
        if (
          ruleWithSteps?.approvalSteps &&
          ruleWithSteps.approvalSteps.length > 0
        ) {
          totalApprovers = ruleWithSteps.approvalSteps.length;
        } else {
          // Otherwise, use manager approvers count
          const approverManagers = await this.getApproverManagers(
            expense.companyId,
          );
          totalApprovers = approverManagers.length;
        }

        if (totalApprovers === 0) return false;

        const approvalPercentage = (approvedCount / totalApprovers) * 100;
        const percentageMet =
          approvalPercentage >= (rule.percentageThreshold || 0);

        const specificApproved = expense.approvalActions.some(
          (action: any) => action.approverId === rule.specificApproverId,
        );
        return percentageMet && specificApproved;
      }

      default:
        return false;
    }
  }

  async assignApprovalRule(expenseId: string): Promise<void> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        submitter: true,
        company: {
          include: {
            approvalRules: {
              where: { isActive: true },
              include: {
                approvalSteps: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const matchingRule = this.findMatchingRule(expense);

    if (!matchingRule) {
      throw new BadRequestException(
        'No matching approval rule found for this expense',
      );
    }

    await this.prisma.expense.update({
      where: { id: expenseId },
      data: { approvalRuleId: matchingRule.id },
    });

    // Send notifications to potential approvers
    await this.notifyPotentialApprovers(expense, matchingRule);
  }

  private async notifyPotentialApprovers(expense: any, rule: any) {
    let approverIds: string[] = [];

    switch (rule.ruleType) {
      case ApprovalRuleType.SEQUENTIAL: {
        const managerChain = await this.buildManagerHierarchy(
          expense.submitter.id,
        );
        // Notify only first manager in sequential
        if (managerChain.length > 0) {
          approverIds = [managerChain[0]];
        }
        break;
      }

      case ApprovalRuleType.PERCENTAGE: {
        // Check if rule has approval steps defined
        if (rule.approvalSteps && rule.approvalSteps.length > 0) {
          approverIds = rule.approvalSteps.map((step: any) => step.approverId);
        } else {
          // Otherwise, notify all manager approvers
          const approverManagers = await this.getApproverManagers(
            expense.companyId,
          );
          approverIds = approverManagers.map((m) => m.id);
        }
        break;
      }

      case ApprovalRuleType.SPECIFIC_APPROVER:
        if (rule.specificApproverId) {
          approverIds = [rule.specificApproverId];
        }
        break;

      case ApprovalRuleType.HYBRID: {
        // Check if rule has approval steps defined
        if (rule.approvalSteps && rule.approvalSteps.length > 0) {
          approverIds = rule.approvalSteps.map((step: any) => step.approverId);
        } else {
          // Otherwise, notify all manager approvers
          const managers = await this.getApproverManagers(expense.companyId);
          approverIds = managers.map((m) => m.id);
        }
        if (
          rule.specificApproverId &&
          !approverIds.includes(rule.specificApproverId)
        ) {
          approverIds.push(rule.specificApproverId);
        }
        break;
      }
    }

    const notificationPromises = approverIds.map((approverId) =>
      this.notificationsService.createNotification({
        userId: approverId,
        type: NotificationType.APPROVAL_REQUEST,
        title: 'New Expense Approval Request',
        message: `${expense.submitter.name} submitted "${expense.title}" for ${expense.originalAmount} ${expense.originalCurrency}`,
        metadata: {
          expenseId: expense.id,
          expenseTitle: expense.title,
          amount: expense.originalAmount,
          currency: expense.originalCurrency,
          submitterName: expense.submitter.name,
        },
      }),
    );

    await Promise.all(notificationPromises);
  }

  private async buildManagerHierarchy(userId: string): Promise<string[]> {
    const managerChain: string[] = [];
    let currentUserId: string | null = userId;

    while (currentUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          managerId: true,
          manager: {
            select: {
              id: true,
              isManagerApprover: true,
            },
          },
        },
      });

      if (!user?.manager) {
        break;
      }

      if (user.manager.isManagerApprover) {
        managerChain.push(user.manager.id);
      }

      currentUserId = user.managerId;
    }

    return managerChain;
  }

  private getApproverManagers(companyId: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        isManagerApprover: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  private findMatchingRule(expense: any): any {
    const rules = expense.company.approvalRules;
    const amount = expense.convertedAmount;

    return rules.find((rule) => {
      if (rule.minAmount !== null && amount < rule.minAmount) return false;
      if (rule.maxAmount !== null && amount > rule.maxAmount) return false;
      return true;
    });
  }

  async getExpenseWorkflow(expenseId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        approvalRule: {
          include: {
            approvalSteps: {
              include: {
                approver: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { sequence: 'asc' },
            },
            specificApprover: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        approvalActions: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        submitter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      expense: {
        id: expense.id,
        title: expense.title,
        status: expense.status,
        submitter: expense.submitter,
      },
      approvalRule: expense.approvalRule,
      approvalActions: expense.approvalActions,
    };
  }
}
