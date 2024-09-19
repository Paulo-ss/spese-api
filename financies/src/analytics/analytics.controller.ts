import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { MessagePattern } from '@nestjs/microservices';
import { IMonthSummary } from './interfaces/month-summary.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import {
  IBarChartReportResponse,
  IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern({ cmd: 'get-month-summary' })
  public async getMonthSummary({
    month,
    userId,
  }: {
    month: string;
    userId: number;
  }): Promise<IMonthSummary> {
    return this.analyticsService.getMonthSummary(month, userId);
  }

  @MessagePattern({ cmd: 'get-expenses-x-category-report' })
  public async getExpensesXCategoryReport(
    filters: ReportFiltersDto,
  ): Promise<IDonutChartReportResponse> {
    return this.analyticsService.getExpensesXCategoryReport(filters);
  }

  @MessagePattern({ cmd: 'get-expenses-x-balances-report' })
  public async getExpensesXBalanceReport(
    filters: ReportFiltersDto,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXBalanceReport(filters);
  }

  @MessagePattern({ cmd: 'get-expenses-x-credit-cards-report' })
  public async getExpensesXCreditCardsReport(
    filters: ReportFiltersDto,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXCreditCardsReport(filters);
  }

  @MessagePattern({ cmd: 'get-investiments-x-month-report' })
  public async getInvestimentsXMonthReport(
    filters: ReportFiltersDto,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getInvestimentsXMonthReport(filters);
  }
}
