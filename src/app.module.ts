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
import { Expense } from './expenses/entities/expense.entity';
import { Income } from './income/entities/income.entity';
import { BankAccount } from './bank-accounts/entities/bank.entity';
import { CreditCard } from './credit-cards/entities/credit-card.entity';
import { Invoice } from './credit-cards/entities/invoice.entity';
import { Subscription } from './credit-cards/entities/subscription.entity';
import { Report } from './analytics/entities/report.entity';
import { User } from './users/entities/user.entity';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';
import { Notification } from './notifications/entities/notification.entity';
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
import { Category } from './category/entities/category.entity';
import { TasksModule } from './tasks/tasks.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { CashFlowByDay } from './cash-flow/entities/cash-flow-by-day.entity';
import { AsyncWorkerModule } from './async-worker/async-worker.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DataSource } from 'typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema,
            load: [config],
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [
                Expense,
                Income,
                BankAccount,
                CreditCard,
                Invoice,
                Subscription,
                Report,
                User,
                BlacklistedToken,
                Notification,
                Category,
                CashFlowByDay,
            ],
            synchronize: !JSON.parse(process.env.IS_PRODUCTION),
            useUTC: true,
            logging: true,
        }),
        ScheduleModule.forRoot(),
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
            },
            plugins: [
                new ClsPluginTransactional({
                    connectionName: 'default',
                    adapter: new TransactionalAdapterTypeOrm({
                        dataSourceToken: DataSource,
                    }),
                }),
            ],
        }),
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
        TasksModule,
        CashFlowModule,
        AsyncWorkerModule,
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
