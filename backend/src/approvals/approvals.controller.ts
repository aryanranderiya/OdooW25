import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalsService } from './approvals.service';
import {
  CreateApprovalRuleDto,
  UpdateApprovalRuleDto,
  ApproveRejectDto,
} from './dto/approval.dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post('rules')
  createRule(@Body() createDto: CreateApprovalRuleDto, @Request() req) {
    return this.approvalsService.createApprovalRule(createDto, req.user.id);
  }

  @Get('rules')
  getRules(@Request() req) {
    return this.approvalsService.findAllRules(req.user.id);
  }

  @Patch('rules/:id')
  updateRule(
    @Param('id') id: string,
    @Body() updateDto: UpdateApprovalRuleDto,
    @Request() req,
  ) {
    return this.approvalsService.updateApprovalRule(id, updateDto, req.user.id);
  }

  @Delete('rules/:id')
  deleteRule(@Param('id') id: string, @Request() req) {
    return this.approvalsService.deleteApprovalRule(id, req.user.id);
  }

  @Get('pending')
  getPendingApprovals(@Request() req) {
    return this.approvalsService.getPendingApprovals(req.user.id);
  }

  @Post(':expenseId/approve')
  approveExpense(
    @Param('expenseId') expenseId: string,
    @Body() dto: ApproveRejectDto,
    @Request() req,
  ) {
    return this.approvalsService.approveExpense(
      expenseId,
      req.user.id,
      dto.comment,
    );
  }

  @Post(':expenseId/reject')
  rejectExpense(
    @Param('expenseId') expenseId: string,
    @Body() dto: ApproveRejectDto,
    @Request() req,
  ) {
    if (!dto.comment) {
      throw new Error('Comment is required for rejection');
    }
    return this.approvalsService.rejectExpense(
      expenseId,
      req.user.id,
      dto.comment,
    );
  }

  @Get('expenses/:expenseId/workflow')
  getExpenseWorkflow(@Param('expenseId') expenseId: string) {
    return this.approvalsService.getExpenseWorkflow(expenseId);
  }
}
