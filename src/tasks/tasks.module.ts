import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { IncomeModule } from 'src/income/income.module';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';

@Module({
  imports: [
    NotificationsModule,
    CreditCardsModule,
    AnalyticsModule,
    IncomeModule,
    BankAccountsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
