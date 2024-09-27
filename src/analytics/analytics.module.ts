import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { IncomeModule } from 'src/income/income.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { ReportsJobService } from './reports-job.service';
import { BullModule } from '@nestjs/bull';
import { ReportsService } from './reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COMMUNICATIONS',
        transport: Transport.TCP,
        options: { port: 8081, host: 'communication' },
      },
    ]),
    BullModule.registerQueue({ name: 'reports' }),
    TypeOrmModule.forFeature([ReportEntity]),
    IncomeModule,
    ExpensesModule,
    CreditCardsModule,
  ],
  controllers: [AnalyticsController, ReportsController],
  providers: [AnalyticsService, ReportsJobService, ReportsService],
  exports: [ReportsService, AnalyticsService],
})
export class AnalyticsModule {}
