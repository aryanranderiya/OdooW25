import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrService } from './ocr.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  UploadReceiptsDto,
} from './dto/expense.dto';
import { ExpenseStatus } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private ocrService: OcrService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate converted amount based on company currency
    const convertedAmount = this.calculateConvertedAmount(
      createExpenseDto.originalAmount,
      createExpenseDto.originalCurrency,
      user.company.currency,
    );

    const expense = await this.prisma.expense.create({
      data: {
        title: createExpenseDto.title,
        description: createExpenseDto.description,
        originalAmount: createExpenseDto.originalAmount,
        originalCurrency: createExpenseDto.originalCurrency,
        convertedAmount,
        companyCurrency: user.company.currency,
        exchangeRate: convertedAmount / createExpenseDto.originalAmount,
        expenseDate: createExpenseDto.expenseDate,
        submitterId: userId,
        companyId: user.companyId,
        categoryId: createExpenseDto.categoryId,
        status: ExpenseStatus.DRAFT,
      },
      include: {
        submitter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        receipts: true,
      },
    });

    return expense;
  }

  async uploadReceipts(
    files: Express.Multer.File[],
    uploadReceiptsDto: UploadReceiptsDto,
    userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const results: Array<{
      receiptId: string;
      filename: string;
      fileSize: number;
      status: string;
      ocrStatus: string;
    }> = [];

    for (const file of files) {
      // Save receipt to database
      const receiptData: any = {
        filename: file.originalname,
        fileUrl: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        ocrProcessed: false,
        uploadedById: userId,
      };

      if (uploadReceiptsDto.expenseId) {
        receiptData.expenseId = uploadReceiptsDto.expenseId;
      }

      const receipt = await this.prisma.receipt.create({
        data: receiptData,
      });

      // Process OCR asynchronously
      void this.processOcrAsync(receipt.id, file.path, file.mimetype);

      results.push({
        receiptId: receipt.id,
        filename: file.originalname,
        fileSize: file.size,
        status: 'uploaded',
        ocrStatus: 'processing',
      });
    }

    return { receipts: results };
  }

  private async processOcrAsync(
    receiptId: string,
    filePath: string,
    mimeType: string,
  ) {
    try {
      console.log(`Starting OCR processing for receipt ${receiptId}`);
      const ocrResult = await this.ocrService.processReceipt(
        filePath,
        mimeType,
      );

      console.log(`OCR completed for receipt ${receiptId}:`, {
        success: ocrResult.success,
        amount: ocrResult.amount,
        vendor: ocrResult.vendor,
        confidence: ocrResult.confidence,
      });

      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrProcessed: true,
          ocrData: ocrResult.rawData,
          extractedAmount: ocrResult.amount,
          extractedDate: ocrResult.date,
          extractedVendor: ocrResult.vendor,
          extractedCategory: ocrResult.category,
        },
      });

      console.log(`OCR data saved to database for receipt ${receiptId}`);
    } catch (error) {
      console.error(`OCR processing failed for receipt ${receiptId}:`, error);
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrProcessed: true,
          ocrData: { error: error.message },
        },
      });
    }
  }

  async createExpenseFromReceipt(receiptId: string, userId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (!receipt.ocrProcessed) {
      throw new BadRequestException('Receipt OCR processing is not complete');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Try to find matching category
    let categoryId: string | null = null;
    if (receipt.extractedCategory) {
      const category = await this.prisma.category.findFirst({
        where: {
          companyId: user.companyId,
          name: { contains: receipt.extractedCategory, mode: 'insensitive' },
        },
      });
      categoryId = category ? category.id : null;
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const convertedAmount = this.calculateConvertedAmount(
      receipt.extractedAmount || 0,
      user.company.currency,
      user.company.currency,
    );

    const expense = await this.prisma.expense.create({
      data: {
        title: `Expense from ${receipt.extractedVendor || 'Receipt'}`,
        description: `Auto-generated from receipt: ${receipt.filename}`,
        originalAmount: receipt.extractedAmount || 0,
        originalCurrency: user.company.currency,
        convertedAmount,
        companyCurrency: user.company.currency,
        exchangeRate: 1.0,
        expenseDate: receipt.extractedDate || new Date(),
        submitterId: userId,
        companyId: user.companyId,
        categoryId,
        status: ExpenseStatus.DRAFT,
      },
      include: {
        submitter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        receipts: true,
      },
    });

    // Link receipt to the created expense
    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { expenseId: expense.id },
    });

    return expense;
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    category?: string;
    userId: string;
  }) {
    const { page, limit, status, category, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      submitterId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          submitter: { select: { name: true, email: true } },
          category: { select: { name: true } },
          receipts: true,
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        submitterId: userId,
      },
      include: {
        submitter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        receipts: true,
      },
    });

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        submitterId: userId,
        status: ExpenseStatus.DRAFT,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or cannot be updated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    let convertedAmount = expense.convertedAmount;
    let exchangeRate = expense.exchangeRate;

    if (updateExpenseDto.originalAmount || updateExpenseDto.originalCurrency) {
      const amount = updateExpenseDto.originalAmount || expense.originalAmount;
      const currency =
        updateExpenseDto.originalCurrency || expense.originalCurrency;

      if (!user || !user.company) {
        throw new NotFoundException('User or company not found');
      }

      convertedAmount = this.calculateConvertedAmount(
        amount,
        currency,
        user.company.currency,
      );
      exchangeRate = convertedAmount / amount;
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...updateExpenseDto,
        convertedAmount,
        exchangeRate,
      },
      include: {
        submitter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        receipts: true,
      },
    });

    return updatedExpense;
  }

  async submitForApproval(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        submitterId: userId,
        status: ExpenseStatus.DRAFT,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or cannot be submitted');
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.PENDING_APPROVAL,
        submittedAt: new Date(),
      },
      include: {
        submitter: { select: { name: true, email: true } },
        category: { select: { name: true } },
        receipts: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        submitterId: userId,
        status: ExpenseStatus.DRAFT,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found or cannot be deleted');
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }

  async getExpenseSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    const [toSubmit, waitingApproval, approved] = await Promise.all([
      this.prisma.expense.aggregate({
        where: {
          submitterId: userId,
          status: ExpenseStatus.DRAFT,
        },
        _count: true,
        _sum: { convertedAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          submitterId: userId,
          status: ExpenseStatus.PENDING_APPROVAL,
        },
        _count: true,
        _sum: { convertedAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: {
          submitterId: userId,
          status: ExpenseStatus.APPROVED,
        },
        _count: true,
        _sum: { convertedAmount: true },
      }),
    ]);

    return {
      toSubmit: {
        count: toSubmit._count,
        totalAmount: toSubmit._sum.convertedAmount || 0,
        currency: user?.company?.currency ?? '',
      },
      waitingApproval: {
        count: waitingApproval._count,
        totalAmount: waitingApproval._sum.convertedAmount || 0,
        currency: user?.company?.currency ?? '',
      },
      approved: {
        count: approved._count,
        totalAmount: approved._sum.convertedAmount || 0,
        currency: user?.company?.currency ?? '',
      },
    };
  }

  async getCategories(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return this.prisma.category.findMany({
      where: { companyId: user?.companyId },
      orderBy: { name: 'asc' },
    });
  }

  async getReceiptOcrStatus(receiptId: string, userId: string) {
    console.log(
      `Getting OCR status for receipt ${receiptId} and user ${userId}`,
    );

    const receipt = await this.prisma.receipt.findUnique({
      where: {
        id: receiptId,
      },
    });

    console.log('Found receipt:', receipt ? 'Yes' : 'No');

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return {
      receiptId: receipt.id,
      ocrProcessed: receipt.ocrProcessed,
      extractedData: {
        amount: receipt.extractedAmount,
        date: receipt.extractedDate,
        vendor: receipt.extractedVendor,
        category: receipt.extractedCategory,
      },
      ocrData: receipt.ocrData,
    };
  }

  private calculateConvertedAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): number {
    // Simplified currency conversion - in production, use a real exchange rate API
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Mock exchange rates - replace with real API
    const exchangeRates = {
      'USD-EUR': 0.85,
      'EUR-USD': 1.18,
      'USD-GBP': 0.73,
      'GBP-USD': 1.37,
    };

    const rateKey = `${fromCurrency}-${toCurrency}`;
    const rate = exchangeRates[rateKey] || 1;

    return amount * rate;
  }
}
