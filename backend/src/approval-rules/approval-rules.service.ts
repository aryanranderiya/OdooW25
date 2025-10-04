import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './dto/approval-rule.dto';

@Injectable()
export class ApprovalRulesService {
  constructor(private prisma: PrismaService) {}

  // Create a new approval rule (Admin only)
  async create(adminId: string, data: CreateApprovalRuleDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create approval rules');
    }

    // Validate approval steps
    if (!data.approvalSteps || data.approvalSteps.length === 0) {
      throw new BadRequestException('At least one approval step is required');
    }

    // Validate approvers exist and belong to same company
    for (const step of data.approvalSteps) {
      const approver = await this.prisma.user.findUnique({
        where: { id: step.approverId },
      });
      
      if (!approver || approver.companyId !== admin.companyId) {
        throw new BadRequestException(`Invalid approver: ${step.approverId}`);
      }
    }

    // Validate specific approver if provided
    if (data.specificApproverId) {
      const specificApprover = await this.prisma.user.findUnique({
        where: { id: data.specificApproverId },
      });
      
      if (!specificApprover || specificApprover.companyId !== admin.companyId) {
        throw new BadRequestException('Invalid specific approver');
      }
    }

    return await this.prisma.approvalRule.create({
      data: {
        name: data.name,
        description: data.description,
        ruleType: data.ruleType,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        percentageThreshold: data.percentageThreshold,
        specificApproverId: data.specificApproverId,
        requireManagerFirst: data.requireManagerFirst || false,
        companyId: admin.companyId,
        approvalSteps: {
          create: data.approvalSteps.map(step => ({
            sequence: step.sequence,
            approverId: step.approverId,
            isRequired: step.isRequired ?? true,
          })),
        },
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  // Get all approval rules for a company
  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.approvalRule.findMany({
      where: {
        companyId: user.companyId,
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get a specific approval rule
  async findOne(userId: string, ruleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rule = await this.prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: user.companyId,
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException('Approval rule not found');
    }

    return rule;
  }

  // Update approval rule (Admin only)
  async update(adminId: string, ruleId: string, data: UpdateApprovalRuleDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update approval rules');
    }

    const rule = await this.prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: admin.companyId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Approval rule not found');
    }

    return await this.prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        percentageThreshold: data.percentageThreshold,
        specificApproverId: data.specificApproverId,
        requireManagerFirst: data.requireManagerFirst,
      },
      include: {
        approvalSteps: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        specificApprover: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  // Delete approval rule (Admin only)
  async delete(adminId: string, ruleId: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete approval rules');
    }

    const rule = await this.prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: admin.companyId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Approval rule not found');
    }

    // Check if rule is being used by any expenses
    const expenseCount = await this.prisma.expense.count({
      where: {
        approvalRuleId: ruleId,
        status: {
          in: ['PENDING_APPROVAL', 'DRAFT'],
        },
      },
    });

    if (expenseCount > 0) {
      throw new BadRequestException('Cannot delete approval rule that is being used by active expenses');
    }

    await this.prisma.approvalRule.delete({
      where: { id: ruleId },
    });

    return { success: true };
  }

  // Find appropriate approval rule for an expense
  async findRuleForExpense(expenseAmount: number, companyId: string) {
    const rules = await this.prisma.approvalRule.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          {
            AND: [
              { minAmount: { lte: expenseAmount } },
              { maxAmount: { gte: expenseAmount } },
            ],
          },
          {
            AND: [
              { minAmount: { lte: expenseAmount } },
              { maxAmount: null },
            ],
          },
          {
            AND: [
              { minAmount: null },
              { maxAmount: { gte: expenseAmount } },
            ],
          },
          {
            AND: [
              { minAmount: null },
              { maxAmount: null },
            ],
          },
        ],
      },
      include: {
        approvalSteps: {
          include: {
            approver: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
        specificApprover: true,
      },
      orderBy: [
        { minAmount: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 1,
    });

    return rules[0] || null;
  }

  // Create approval requests based on rule
  async createApprovalRequests(expenseId: string, rule: any, submitterId: string) {
    const approvalRequests: any[] = [];

    if (!rule) {
      // Default manager approval if no rule
      const submitter = await this.prisma.user.findUnique({
        where: { id: submitterId },
      });

      if (submitter?.managerId) {
        const request = await this.prisma.approvalRequest.create({
          data: {
            expenseId,
            approverId: submitter.managerId,
            stepNumber: 1,
            status: 'PENDING',
          },
        });
        approvalRequests.push(request);
      }
      return approvalRequests;
    }

    // Create requests based on rule type
    switch (rule.ruleType) {
      case 'SEQUENTIAL':
        // Only create the first step initially
        if (rule.requireManagerFirst) {
          const submitter = await this.prisma.user.findUnique({
            where: { id: submitterId },
          });
          if (submitter?.managerId) {
            const managerRequest = await this.prisma.approvalRequest.create({
              data: {
                expenseId,
                approverId: submitter.managerId,
                stepNumber: 0,
                status: 'PENDING',
              },
            });
            approvalRequests.push(managerRequest);
          }
        } else if (rule.approvalSteps.length > 0) {
          const firstStep = rule.approvalSteps[0];
          const request = await this.prisma.approvalRequest.create({
            data: {
              expenseId,
              approverId: firstStep.approverId,
              stepNumber: 1,
              status: 'PENDING',
            },
          });
          approvalRequests.push(request);
        }
        break;

      case 'PERCENTAGE':
      case 'HYBRID':
        // Create requests for all approvers
        for (const step of rule.approvalSteps) {
          const request = await this.prisma.approvalRequest.create({
            data: {
              expenseId,
              approverId: step.approverId,
              stepNumber: step.sequence,
              status: 'PENDING',
            },
          });
          approvalRequests.push(request);
        }
        break;

      case 'SPECIFIC_APPROVER':
        // Create request for specific approver
        if (rule.specificApproverId) {
          const request = await this.prisma.approvalRequest.create({
            data: {
              expenseId,
              approverId: rule.specificApproverId,
              stepNumber: 1,
              status: 'PENDING',
            },
          });
          approvalRequests.push(request);
        }
        break;
    }

    return approvalRequests;
  }
}
