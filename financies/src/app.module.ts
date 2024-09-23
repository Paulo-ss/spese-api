import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomeModule } from './income/income.module';
import { CommonModule } from './common/common.module';
import { ExpenseEntity } from './expenses/entities/expense.entity';
import { IncomeEntity } from './income/entities/income.entity';
import { WageEntity } from './income/entities/wage.entity';
import { BankAccountEntity } from './bank-accounts/entities/bank.entity';
import { CreditCardEntity } from './credit-cards/entities/credit-card.entity';
import { InvoiceEntity } from './credit-cards/entities/invoice.entity';
import { SubscriptionEntity } from './credit-cards/entities/subscription.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BullModule } from '@nestjs/bull';
import { ReportEntity } from './analytics/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        ExpenseEntity,
        IncomeEntity,
        WageEntity,
        BankAccountEntity,
        CreditCardEntity,
        InvoiceEntity,
        SubscriptionEntity,
        ReportEntity,
      ],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({ redis: { host: 'redis', port: 6379 } }),
    CreditCardsModule,
    BankAccountsModule,
    ExpensesModule,
    IncomeModule,
    CommonModule,
    TasksModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
