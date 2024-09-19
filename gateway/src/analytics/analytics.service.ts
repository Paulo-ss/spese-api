import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IMonthSummary } from './interfaces/month-summary.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import {
  IBarChartReportResponse,
  IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async getMonthSummary({
    month,
    userId,
  }: {
    month: string;
    userId: number;
  }): Promise<IMonthSummary> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'get-month-summary' },
        { month, userId },
      ),
    );

    return response;
  }

  public async getExpensesXCategoryReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IDonutChartReportResponse> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'get-expenses-x-category-report' },
        { ...filters, userId },
      ),
    );

    return response;
  }

  public async getExpensesXBalanceReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'get-expenses-x-balances-report' },
        { ...filters, userId },
      ),
    );

    return response;
  }

  public async getExpensesXCreditCardsReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'get-expenses-x-credit-cards-report' },
        { ...filters, userId },
      ),
    );

    return response;
  }

  public async getInvestimentsXMonthReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'get-investiments-x-month-report' },
        { ...filters, userId },
      ),
    );

    return response;
  }
}
