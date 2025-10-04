import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CompaniesModule,
    ExpensesModule,
    NotificationsModule,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
