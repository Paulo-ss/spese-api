import { Body, Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { IMonthSummary } from './interfaces/month-summary.interface';
import {
  IBarChartReportResponse,
  IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('month-summary')
  public async getMonthSummary(
    @CurrentUser() userId: number,
    @Body() { month }: { month: string },
  ): Promise<IMonthSummary> {
    return this.analyticsService.getMonthSummary({ month, userId });
  }

  @Get('reports/expenses-x-category')
  public async getExpensesXCategoryReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IDonutChartReportResponse> {
    return this.analyticsService.getExpensesXCategoryReport(filters, userId);
  }

  @Get('reports/expenses-x-balances')
  public async getExpensesXBalanceReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXBalanceReport(filters, userId);
  }

  @Get('reports/expenses-x-credit-cards')
  public async getExpensesXCreditCardsReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXCreditCardsReport(filters, userId);
  }

  @Get('reports/investiments-x-month')
  public async getInvestimentsXMonthReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getInvestimentsXMonthReport(filters, userId);
  }
}
