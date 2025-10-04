import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { EscalationService } from './escalation.service';
import { ProcessApprovalDto, GetPendingApprovalsQueryDto } from './dto/approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(
    private readonly approvalsService: ApprovalsService,
    private readonly escalationService: EscalationService,
  ) {}

  // Get pending approvals for current user
  @Get('pending')
  getPendingApprovals(
    @UserId() userId: string,
    @Query() query: GetPendingApprovalsQueryDto,
  ) {
    return this.approvalsService.getPendingApprovals(userId, query);
  }

  // Get all pending approvals (admin only)
  @Get('all-pending')
  getAllPendingApprovals(
    @UserId() userId: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.approvalsService.getAllPendingApprovals(userId, companyId);
  }

  // Process approval (approve or reject)
  @Post('expenses/:expenseId/process')
  processApproval(
    @UserId() userId: string,
    @Param('expenseId') expenseId: string,
    @Body() data: ProcessApprovalDto,
  ) {
    return this.approvalsService.processApproval(userId, expenseId, data);
  }

  // Manual escalation (Admin only)
  @Post('requests/:requestId/escalate')
  escalateApproval(
    @UserId() userId: string,
    @Param('requestId') requestId: string,
    @Body('newApproverId') newApproverId: string,
  ) {
    return this.escalationService.manualEscalation(userId, requestId, newApproverId);
  }

  // Process all escalations (Admin only)
  @Post('process-escalations')
  processEscalations(@UserId() userId: string) {
    return this.escalationService.processEscalations();
  }
}
