import { Injectable } from '@nestjs/common';
import {
    isEmpty,
    isNull,
    isNullOrUndefined,
    isUndefined,
} from 'src/common/utils/validation.utils';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { ExpenseStatus } from 'src/expenses/enums/expense-status.enum';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomeService } from 'src/income/income.service';
import { IMonthSummary } from './interfaces/month-summary.interface';
import { ReportFiltersDto } from './dto/report-filters.dto';
import {
    IBarChartReportResponse,
    IDonutChartReportResponse,
} from './interfaces/reports-responses.interface';
import { ExpenseCategory } from 'src/expenses/enums/expense-category.enum';
import { formatDate, getMonthsInBetween } from '../common/utils/dates.utils';

@Injectable()
export class AnalyticsService {
    constructor(
        private readonly incomeService: IncomeService,
        private readonly expensesService: ExpensesService,
        private readonly creditCardService: CreditCardsService,
    ) {}

    public async getMonthSummary(
        date: string,
        userId: number,
    ): Promise<IMonthSummary> {
        let monthPaidExpensesTotal = 0;
        let monthExpensesTotal = 0;

        const monthExpenses = await this.expensesService.findByFilters({
            month: date,
            userId,
        });
        if (!isNullOrUndefined(monthExpenses) && !isEmpty(monthExpenses)) {
            monthExpenses.forEach((expense) => {
                if (expense.status === ExpenseStatus.PAID) {
                    monthPaidExpensesTotal += expense.price;
                }

                monthExpensesTotal += expense.price;
            });
        }

        const usersMonthTotalIncome =
            await this.incomeService.getUsersMonthTotalIncome(userId, date);

        return {
            budget: usersMonthTotalIncome,
            expensesTotal: monthExpensesTotal,
            paidTotal: monthPaidExpensesTotal,
            monthBalance: usersMonthTotalIncome - monthExpensesTotal,
        };
    }

    public async getExpensesXCategoryReport(
        filters: ReportFiltersDto,
        userId: number,
    ): Promise<IDonutChartReportResponse | null> {
        const expenses = await this.expensesService.findByFilters({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            userId: userId,
        });

        if (
            isNull(expenses) ||
            isUndefined(expenses) ||
            expenses.length === 0
        ) {
            return null;
        }

        const mappedExpensesByCategory = new Map<ExpenseCategory, number>();
        for (const expense of expenses) {
            const categoryExpenseTotal = mappedExpensesByCategory.get(
                expense.category,
            );

            if (isUndefined(categoryExpenseTotal)) {
                mappedExpensesByCategory.set(
                    expense.category,
                    Number(expense.price),
                );
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
        const monthsRange = getMonthsInBetween(
            filters.fromDate,
            filters.toDate,
        );

        const mappedMonthsSummaries = new Map<string, IMonthSummary>();
        for (const month of monthsRange) {
            const formattedMonth = formatDate(month, 'YYYY-MM');
            const summary = await this.getMonthSummary(formattedMonth, userId);

            mappedMonthsSummaries.set(formattedMonth, summary);
        }

        const expensesSeriesArray = Array.from(
            mappedMonthsSummaries.values(),
        ).map((summary) => summary.expensesTotal);
        const balanceSeriesArray = Array.from(
            mappedMonthsSummaries.values(),
        ).map((summary) => summary.monthBalance);

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
        const monthsRange = getMonthsInBetween(
            filters.fromDate,
            filters.toDate,
        );

        const mappedMonthCreditCardTotal = new Map<string, number>();
        for (const month of monthsRange) {
            const formattedMonth = formatDate(month, 'YYYY-MM');
            const { invoicesTotal } =
                await this.creditCardService.getUserMonthCreditCardTotal(
                    userId,
                    formattedMonth,
                );
            mappedMonthCreditCardTotal.set(formattedMonth, invoicesTotal);
        }

        return {
            categories: Array.from(mappedMonthCreditCardTotal.keys()),
            series: [{ data: Array.from(mappedMonthCreditCardTotal.values()) }],
        };
    }

    public async getInvestmentsXMonthReport(
        filters: ReportFiltersDto,
        userId: number,
    ): Promise<IBarChartReportResponse> {
        const monthsRange = getMonthsInBetween(
            filters.fromDate,
            filters.toDate,
        );

        const mappedMonthInvestment = new Map<string, number>();
        for (const month of monthsRange) {
            const investments = await this.expensesService.findByFilters({
                month: formatDate(month, 'YYYY-MM'),
                userId: userId,
                category: ExpenseCategory.INVESTMENT,
            });

            const totalInvestment = investments.reduce((total, investment) => {
                return total + Number(investment.price);
            }, 0);

            mappedMonthInvestment.set(
                formatDate(month, 'YYYY-MM'),
                totalInvestment,
            );
        }

        return {
            categories: Array.from(mappedMonthInvestment.keys()),
            series: [{ data: Array.from(mappedMonthInvestment.values()) }],
        };
    }
}
