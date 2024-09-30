import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IncomeModule } from './income/income.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ExpenseEntity } from './expenses/entities/expense.entity';
import { IncomeEntity } from './income/entities/income.entity';
import { WageEntity } from './income/entities/wage.entity';
import { BankAccountEntity } from './bank-accounts/entities/bank.entity';
import { CreditCardEntity } from './credit-cards/entities/credit-card.entity';
import { InvoiceEntity } from './credit-cards/entities/invoice.entity';
import { SubscriptionEntity } from './credit-cards/entities/subscription.entity';
import { ReportEntity } from './analytics/entities/report.entity';
import { UserEntity } from './users/entities/user.entity';
import { BlacklistedTokenEntity } from './auth/entities/blacklisted-token.entity';
import { NotificationEntity } from './notifications/entities/notification.entity';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { CreditCardsController } from './credit-cards/credit-cards.controller';
import { ExpensesController } from './expenses/expenses.controller';
import { IncomeController } from './income/income.controller';
import { AuthController } from './auth/auth.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { ReportsController } from './analytics/reports.controller';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/schema/config.schema';
import { config } from './config';
import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoryModule } from './category/category.module';
import { CategoryEntity } from './category/entities/category.entity';

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
        UserEntity,
        BlacklistedTokenEntity,
        ReportEntity,
        NotificationEntity,
        CategoryEntity,
      ],
      synchronize: !JSON.parse(process.env.IS_PRODUCTION),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: JSON.parse(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true, validationSchema, load: [config] }),
    UsersModule,
    AuthModule,
    BankAccountsModule,
    IncomeModule,
    CreditCardsModule,
    ExpensesModule,
    AnalyticsModule,
    CommonModule,
    NotificationsModule,
    CategoryModule,
  ],
  controllers: [
    AppController,
    UsersController,
    AnalyticsController,
    CreditCardsController,
    ExpensesController,
    IncomeController,
    AuthController,
    NotificationsController,
    ReportsController,
  ],
  providers: [AppService],
})
export class AppModule {}
