import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [AuthModule, CurrencyModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
