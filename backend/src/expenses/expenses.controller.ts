import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  UploadReceiptsDto,
} from './dto/expense.dto';
import type {
  CreateExpenseRequest,
  GetExpensesQuery,
} from './types/expense.types';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(createExpenseDto, req.user.id);
  }

  // Legacy create method
  @Post('legacy')
  createLegacy(@UserId() userId: string, @Body() data: CreateExpenseRequest) {
    return this.expensesService.create(userId, data);
  }

  @Post('upload-receipts')
  @UseInterceptors(FilesInterceptor('receipts', 10))
  async uploadReceipts(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadReceiptsDto: UploadReceiptsDto,
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one receipt file is required');
    }

    return this.expensesService.uploadReceipts(
      files,
      uploadReceiptsDto,
      req.user.id,
    );
  }

  @Post('create-from-receipt/:receiptId')
  async createFromReceipt(
    @Param('receiptId') receiptId: string,
    @Request() req,
  ) {
    return this.expensesService.createExpenseFromReceipt(
      receiptId,
      req.user.id,
    );
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Request() req?,
  ) {
    return this.expensesService.findAll({
      page,
      limit,
      status,
      category,
      userId: req.user.id,
    });
  }

  // Legacy findAll method
  @Get('legacy')
  findAllLegacy(@UserId() userId: string, @Query() query: GetExpensesQuery) {
    return this.expensesService.findAll(userId, query);
  }

  @Get('summary')
  async getSummary(@Request() req) {
    return this.expensesService.getExpenseSummary(req.user.id);
  }

  @Get('categories')
  async getCategories(@Request() req) {
    return this.expensesService.getCategories(req.user.id);
  }

  // Legacy getCategories method
  @Get('categories/legacy')
  getCategoriesLegacy(@UserId() userId: string) {
    return this.expensesService.getCategories(userId);
  }

  @Get('receipts/:receiptId/ocr-status')
  async getOcrStatus(@Param('receiptId') receiptId: string, @Request() req) {
    return this.expensesService.getReceiptOcrStatus(receiptId, req.user.id);
  }

  @Post('receipts/:receiptId/correct-ocr')
  async correctOcr(
    @Param('receiptId') receiptId: string,
    @Body() correctionData: any,
    @Request() req,
  ) {
    return this.expensesService.correctOcrData(
      receiptId,
      correctionData,
      req.user.id,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const expense = await this.expensesService.findOne(id, req.user.id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  // Legacy findOne method
  @Get('legacy/:id')
  findOneLegacy(@UserId() userId: string, @Param('id') id: string) {
    return this.expensesService.findOne(userId, id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req,
  ) {
    return this.expensesService.update(id, updateExpenseDto, req.user.id);
  }

  @Patch(':id/submit')
  async submit(@Param('id') id: string, @Request() req) {
    return this.expensesService.submitForApproval(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.expensesService.remove(id, req.user.id);
  }
}
