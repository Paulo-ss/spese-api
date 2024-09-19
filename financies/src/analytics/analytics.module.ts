import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { IncomeModule } from 'src/income/income.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';

@Module({
  imports: [IncomeModule, ExpensesModule, CreditCardsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
