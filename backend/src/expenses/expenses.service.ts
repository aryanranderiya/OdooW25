import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, SubmitExpenseDto, GetExpensesQueryDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  // Create a new expense (draft status)
  async create(userId: string, data: CreateExpenseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.expense.create({
      data: {
        title: data.title,
        description: data.description,
        originalAmount: data.originalAmount,
        originalCurrency: data.originalCurrency,
        convertedAmount: data.originalAmount, // Simple 1:1 conversion for now
        companyCurrency: user.company.currency,
        exchangeRate: 1.0,
        expenseDate: new Date(data.expenseDate),
        status: 'DRAFT',
        submitterId: userId,
        companyId: user.companyId,
        categoryId: data.categoryId || null,
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        receipts: true,
        approvalRequests: {
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  // Submit expense for approval
  async submitForApproval(userId: string, expenseId: string, data?: SubmitExpenseDto) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        submitterId: userId,
        status: 'DRAFT',
      },
      include: {
        submitter: true,
        company: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or already submitted');
    }

    // Find appropriate approval rule
    const approvalRule = await this.findApprovalRule(expense.convertedAmount, expense.companyId);

    return await this.prisma.$transaction(async (tx) => {
      // Update expense status and assign approval rule
      const updatedExpense = await tx.expense.update({
        where: { id: expenseId },
        data: {
          status: 'PENDING_APPROVAL',
          submittedAt: new Date(),
          approvalRuleId: approvalRule?.id || null,
        },
        include: {
          submitter: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: { id: true, name: true },
          },
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
              specificApprover: true,
            },
          },
        },
      });

      // Create approval requests based on rule
      await this.createApprovalRequests(tx, expenseId, approvalRule, expense.submitterId);

      return updatedExpense;
    });
  }

  // Get expenses for a user
  async findAll(userId: string, query: GetExpensesQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const whereClause: any = {
      submitterId: userId,
    };

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.categoryId) {
      whereClause.categoryId = query.categoryId;
    }

    if (query.startDate || query.endDate) {
      whereClause.expenseDate = {};
      if (query.startDate) {
        whereClause.expenseDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereClause.expenseDate.lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.expense.findMany({
      where: whereClause,
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        receipts: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get a specific expense
  async findOne(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        submitterId: userId,
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        receipts: true,
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
        approvalRule: {
          include: {
            approvalSteps: {
              include: {
                approver: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: {
                sequence: 'asc',
              },
            },
            specificApprover: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  // Update expense (only if in draft status)
  async update(userId: string, expenseId: string, data: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        submitterId: userId,
        status: 'DRAFT',
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or cannot be edited');
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    if (data.originalAmount !== undefined) {
      updateData.originalAmount = data.originalAmount;
      updateData.convertedAmount = data.originalAmount; // Simple conversion
    }

    if (data.originalCurrency !== undefined) {
      updateData.originalCurrency = data.originalCurrency;
    }

    if (data.expenseDate !== undefined) {
      updateData.expenseDate = new Date(data.expenseDate);
    }

    return await this.prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        receipts: true,
      },
    });
  }

  // Delete expense (only if in draft status)
  async delete(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        submitterId: userId,
        status: 'DRAFT',
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or cannot be deleted');
    }

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return { success: true };
  }

  // Get categories for a user's company
  async getCategories(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.category.findMany({
      where: {
        companyId: user.companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Private helper methods
  private async findApprovalRule(expenseAmount: number, companyId: string) {
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

  private async createApprovalRequests(tx: any, expenseId: string, rule: any, submitterId: string) {
    if (!rule) {
      // Default manager approval if no rule
      const submitter = await tx.user.findUnique({
        where: { id: submitterId },
      });

      if (submitter?.managerId) {
        await tx.approvalRequest.create({
          data: {
            expenseId,
            approverId: submitter.managerId,
            stepNumber: 1,
            status: 'PENDING',
          },
        });
      }
      return;
    }

    // Create requests based on rule type
    switch (rule.ruleType) {
      case 'SEQUENTIAL':
        // Only create the first step initially
        if (rule.requireManagerFirst) {
          const submitter = await tx.user.findUnique({
            where: { id: submitterId },
          });
          if (submitter?.managerId) {
            await tx.approvalRequest.create({
              data: {
                expenseId,
                approverId: submitter.managerId,
                stepNumber: 0,
                status: 'PENDING',
              },
            });
          }
        } else if (rule.approvalSteps.length > 0) {
          const firstStep = rule.approvalSteps[0];
          await tx.approvalRequest.create({
            data: {
              expenseId,
              approverId: firstStep.approverId,
              stepNumber: 1,
              status: 'PENDING',
            },
          });
        }
        break;

      case 'PERCENTAGE':
      case 'HYBRID':
        // Create requests for all approvers
        for (const step of rule.approvalSteps) {
          await tx.approvalRequest.create({
            data: {
              expenseId,
              approverId: step.approverId,
              stepNumber: step.sequence,
              status: 'PENDING',
            },
          });
        }
        break;

      case 'SPECIFIC_APPROVER':
        // Create request for specific approver
        if (rule.specificApproverId) {
          await tx.approvalRequest.create({
            data: {
              expenseId,
              approverId: rule.specificApproverId,
              stepNumber: 1,
              status: 'PENDING',
            },
          });
        }
        break;
    }
  }
}
