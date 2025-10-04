import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, SubmitExpenseDto, GetExpensesQueryDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // Create expense
  @Post()
  create(@UserId() userId: string, @Body() data: CreateExpenseDto) {
    return this.expensesService.create(userId, data);
  }

  // Get all expenses for user
  @Get()
  findAll(@UserId() userId: string, @Query() query: GetExpensesQueryDto) {
    return this.expensesService.findAll(userId, query);
  }

  // Get categories
  @Get('categories')
  getCategories(@UserId() userId: string) {
    return this.expensesService.getCategories(userId);
  }

  // Get specific expense
  @Get(':id')
  findOne(@UserId() userId: string, @Param('id') id: string) {
    return this.expensesService.findOne(userId, id);
  }

  // Submit expense for approval
  @Post(':id/submit')
  submitForApproval(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() data: SubmitExpenseDto,
  ) {
    return this.expensesService.submitForApproval(userId, id, data);
  }

  // Update expense (draft only)
  @Put(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() data: UpdateExpenseDto,
  ) {
    return this.expensesService.update(userId, id, data);
  }

  // Delete expense (draft only)
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.expensesService.delete(userId, id);
  }
}
