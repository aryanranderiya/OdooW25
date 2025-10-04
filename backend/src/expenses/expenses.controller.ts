import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserId } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import type {
  CreateExpenseRequest,
  GetExpensesQuery,
} from './types/expense.types';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@UserId() userId: string, @Body() data: CreateExpenseRequest) {
    return this.expensesService.create(userId, data);
  }

  @Get()
  findAll(@UserId() userId: string, @Query() query: GetExpensesQuery) {
    return this.expensesService.findAll(userId, query);
  }

  @Get('categories')
  getCategories(@UserId() userId: string) {
    return this.expensesService.getCategories(userId);
  }
}
