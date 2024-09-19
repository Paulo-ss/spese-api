import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { IncomeModule } from './income/income.module';
import { CreditCardModule } from './credit-card/credit-card.module';
import { ExpenseModule } from './expense/expense.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [UsersModule, AuthModule, BankAccountModule, IncomeModule, CreditCardModule, ExpenseModule, AnalyticsModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
