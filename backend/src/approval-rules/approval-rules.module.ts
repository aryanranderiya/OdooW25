import { Module } from '@nestjs/common';
import { ApprovalRulesService } from './approval-rules.service';
import { ApprovalRulesController } from './approval-rules.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ApprovalRulesController],
  providers: [ApprovalRulesService, PrismaService],
  exports: [ApprovalRulesService],
})
export class ApprovalRulesModule {}
