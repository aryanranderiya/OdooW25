import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { EscalationService } from './escalation.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ApprovalsController],
  providers: [ApprovalsService, EscalationService, PrismaService],
  exports: [ApprovalsService, EscalationService],
})
export class ApprovalsModule {}
