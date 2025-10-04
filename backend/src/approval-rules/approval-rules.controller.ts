import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApprovalRulesService } from './approval-rules.service';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './dto/approval-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/current-user.decorator';

@Controller('approval-rules')
@UseGuards(JwtAuthGuard)
export class ApprovalRulesController {
  constructor(private readonly approvalRulesService: ApprovalRulesService) {}

  // Create approval rule (Admin only)
  @Post()
  create(@UserId() userId: string, @Body() data: CreateApprovalRuleDto) {
    return this.approvalRulesService.create(userId, data);
  }

  // Get all approval rules
  @Get()
  findAll(@UserId() userId: string) {
    return this.approvalRulesService.findAll(userId);
  }

  // Get specific approval rule
  @Get(':id')
  findOne(@UserId() userId: string, @Param('id') id: string) {
    return this.approvalRulesService.findOne(userId, id);
  }

  // Update approval rule (Admin only)
  @Put(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() data: UpdateApprovalRuleDto,
  ) {
    return this.approvalRulesService.update(userId, id, data);
  }

  // Delete approval rule (Admin only)
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.approvalRulesService.delete(userId, id);
  }
}
