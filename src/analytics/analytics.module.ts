import { forwardRef, Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { IncomeModule } from 'src/income/income.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AsyncWorkerModule } from '../async-worker/async-worker.module';
import { ReportRepository } from './report.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Report]),
        forwardRef(() => IncomeModule),
        ExpensesModule,
        CreditCardsModule,
        NotificationsModule,
        forwardRef(() => AsyncWorkerModule),
    ],
    controllers: [AnalyticsController, ReportsController],
    providers: [AnalyticsService, ReportsService, ReportRepository],
    exports: [ReportsService, AnalyticsService],
})
export class AnalyticsModule {}
