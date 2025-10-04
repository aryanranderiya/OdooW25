import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseRequest, GetExpensesQuery } from './types/expense.types';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
  ) {}

  async create(userId: string, data: CreateExpenseRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert currency to company's base currency (typically USD)
    const { convertedAmount, exchangeRate } =
      await this.currencyService.convertCurrency(
        data.originalAmount,
        data.originalCurrency,
        user.company.currency,
      );

    return await this.prisma.expense.create({
      data: {
        title: data.title,
        description: data.description,
        originalAmount: data.originalAmount,
        originalCurrency: data.originalCurrency,
        convertedAmount,
        companyCurrency: user.company.currency,
        exchangeRate,
        expenseDate: new Date(data.expenseDate),
        status: 'DRAFT',
        submitterId: userId,
        companyId: user.companyId,
        categoryId: data.categoryId || null, // Make categoryId optional
      },
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(userId: string, query?: GetExpensesQuery) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const where: any = {
      companyId: user.companyId,
    };

    // Employees can only see their own expenses
    if (user.role === 'EMPLOYEE') {
      where.submitterId = userId;
    }

    // Simple search filter
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.status) {
      where.status = query.status;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        submitter: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return expenses;
  }

  async findOne(userId: string, expenseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        companyId: user.companyId,
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
              select: { name: true },
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

  async getCategories(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const categories = await this.prisma.category.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return categories;
  }
}
