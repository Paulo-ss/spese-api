import { Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { ExpenseStatus } from 'src/expenses/enums/expense-status.enum';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomeService } from 'src/income/income.service';
import { WageService } from 'src/income/wage.service';
import { IMonthSummary } from './interfaces/month-summary.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import {
  IBarChartReportResponse,
  IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';
import { ExpenseCategory } from 'src/expenses/enums/expense-category.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly wageService: WageService,
    private readonly expensesService: ExpensesService,
    private readonly creditCardService: CreditCardsService,
  ) {}

  private static generateMonthsRange(
    fromDate: string,
    toDate?: string,
  ): string[] {
    const monthsRange: string[] = [];
    const [month, year] = fromDate.split('-').map(Number);

    if (!isEmpty(toDate)) {
      const [toMonth, toYear] = toDate.split('-').map(Number);

      for (
        const date = new Date(year, month - 1);
        date <= new Date(toYear, toMonth - 1);
        date.setMonth(date.getMonth() + 1)
      ) {
        const [newYear, newMonth] = new Date(date)
          .toISOString()
          .split('T')[0]
          .split('-');
        monthsRange.push(`${newMonth}-${newYear}`);
      }
    }

    if (monthsRange.length === 0) {
      monthsRange.push(fromDate);
    }

    return monthsRange;
  }

  public async getMonthSummary(
    month: string,
    userId: number,
  ): Promise<IMonthSummary> {
    let monthPaidExpensesTotal = 0;
    let monthExpensesTotal = 0;

    const monthExpenses = await this.expensesService.findByFilters(
      {
        fromMonth: month,
        userId,
      },
      true,
    );
    if (
      !isNull(monthExpenses) &&
      !isUndefined(monthExpenses) &&
      !isEmpty(monthExpenses)
    ) {
      monthExpenses.forEach((expense) => {
        if (expense.status === ExpenseStatus.PAID) {
          monthPaidExpensesTotal += Number(expense.price);
        }

        monthExpensesTotal += Number(expense.price);
      });
    }

    const { invoicesTotal, paidInvoicesTotal } =
      await this.creditCardService.getUsersMonthCreditCardTotal(userId, month);
    if (invoicesTotal) {
      monthExpensesTotal += invoicesTotal;
    }

    if (paidInvoicesTotal) {
      monthPaidExpensesTotal += paidInvoicesTotal;
    }

    const usersMonthTotalIncome =
      await this.incomeService.getUsersMonthTotalIncome(userId, month);
    const userWage = Number((await this.wageService.findByUserId(userId)).wage);
    const budget = usersMonthTotalIncome + userWage;

    return {
      budget,
      expensesTotal: monthExpensesTotal,
      paidTotal: monthPaidExpensesTotal,
      monthBalance: budget - monthExpensesTotal,
    };
  }

  public async getExpensesXCategoryReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IDonutChartReportResponse | null> {
    const expenses = await this.expensesService.findByFilters({
      fromMonth: filters.fromDate,
      toMonth: filters.toDate,
      userId: userId,
    });

    if (isNull(expenses) || isUndefined(expenses) || expenses.length === 0) {
      return null;
    }

    const mappedExpensesByCategory = new Map<ExpenseCategory, number>();
    for (const expense of expenses) {
      const categoryExpenseTotal = mappedExpensesByCategory.get(
        expense.category,
      );

      if (isUndefined(categoryExpenseTotal)) {
        mappedExpensesByCategory.set(expense.category, Number(expense.price));
        continue;
      }

      mappedExpensesByCategory.set(
        expense.category,
        categoryExpenseTotal + Number(expense.price),
      );
    }

    return {
      series: Array.from(mappedExpensesByCategory.values()).map(
        (categoryTotal) => categoryTotal,
      ),
      labels: Array.from(mappedExpensesByCategory.keys()).map(
        (category) => category,
      ),
    };
  }

  public async getExpensesXBalanceReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse | null> {
    const monthsRange = AnalyticsService.generateMonthsRange(
      filters.fromDate,
      filters.toDate,
    );

    const mappedMonthsSummaries = new Map<string, IMonthSummary>();
    for (const monthRange of monthsRange) {
      const summary = await this.getMonthSummary(monthRange, userId);

      mappedMonthsSummaries.set(monthRange, summary);
    }

    const expensesSeriesArray = Array.from(mappedMonthsSummaries.values()).map(
      (summary) => summary.expensesTotal,
    );
    const balanceSeriesArray = Array.from(mappedMonthsSummaries.values()).map(
      (summary) => summary.monthBalance,
    );

    return {
      categories: Array.from(mappedMonthsSummaries.keys()),
      series: [
        { name: 'Gastos', data: expensesSeriesArray },
        { name: 'Saldo do Mês', data: balanceSeriesArray },
      ],
    };
  }

  public async getExpensesXCreditCardsReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse> {
    const monthsRange = AnalyticsService.generateMonthsRange(
      filters.fromDate,
      filters.toDate,
    );

    const mappedMonthCreditCardTotal = new Map<string, number>();
    for (const month of monthsRange) {
      const { invoicesTotal } =
        await this.creditCardService.getUsersMonthCreditCardTotal(
          userId,
          month,
        );
      mappedMonthCreditCardTotal.set(month, invoicesTotal);
    }

    return {
      categories: Array.from(mappedMonthCreditCardTotal.keys()),
      series: [{ data: Array.from(mappedMonthCreditCardTotal.values()) }],
    };
  }

  public async getInvestimentsXMonthReport(
    filters: ReportFiltersDto,
    userId: number,
  ): Promise<IBarChartReportResponse> {
    const monthsRange = AnalyticsService.generateMonthsRange(
      filters.fromDate,
      filters.toDate,
    );

    const mappedMonthInvestiment = new Map<string, number>();
    for (const month of monthsRange) {
      const investiments = await this.expensesService.findByFilters({
        fromMonth: month,
        userId: userId,
        category: ExpenseCategory.INVESTIMENT,
      });

      const investimentTotal =
        investiments.length === 0
          ? 0
          : investiments.reduce((total, investiment) => {
              return total + Number(investiment.price);
            }, 0);

      mappedMonthInvestiment.set(month, investimentTotal);
    }

    return {
      categories: Array.from(mappedMonthInvestiment.keys()),
      series: [{ data: Array.from(mappedMonthInvestiment.values()) }],
    };
  }
}
