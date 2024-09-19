import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { IMonthSummary } from './interfaces/month-summary.interface';
import {
  IBarChartReportResponse,
  IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('month-summary')
  public async getMonthSummary(
    @CurrentUser() userId: number,
    @Body() { month }: { month: string },
  ): Promise<IMonthSummary> {
    return this.analyticsService.getMonthSummary({ month, userId });
  }

  @Post('reports/expenses-x-category')
  public async getExpensesXCategoryReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IDonutChartReportResponse> {
    return this.analyticsService.getExpensesXCategoryReport(filters, userId);
  }

  @Post('reports/expenses-x-balances')
  public async getExpensesXBalanceReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXBalanceReport(filters, userId);
  }

  @Post('reports/expenses-x-credit-cards')
  public async getExpensesXCreditCardsReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getExpensesXCreditCardsReport(filters, userId);
  }

  @Post('reports/investiments-x-month')
  public async getInvestimentsXMonthReport(
    @Body() filters: ReportFiltersDto,
    @CurrentUser() userId: number,
  ): Promise<IBarChartReportResponse> {
    return this.analyticsService.getInvestimentsXMonthReport(filters, userId);
  }
}
