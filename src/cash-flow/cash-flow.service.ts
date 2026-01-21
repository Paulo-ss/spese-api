import { Injectable, Logger } from '@nestjs/common';
import { CashFlowDayEntity } from './entities/cash-flow-daily.entity';
import { FindOperator, FindOptionsOrder, LessThan, MoreThan } from 'typeorm';
import {
    ICashFlowResponse,
    TDailyCashFlow,
} from './interfaces/cash-flow.interface';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { CommonService } from 'src/common/common.service';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { OperationType } from '../common/interfaces/operation-type';
import { ExpensesService } from 'src/expenses/expenses.service';
import {
    formatDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    getMonthCalendarDates,
    getToday,
    isDateGreaterThanOrEqualTo,
} from 'src/common/utils/dates.utils';
import { IncomeService } from 'src/income/income.service';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { ITransactionMessage } from '../async-worker/types/messages';
import * as dayjs from 'dayjs';

@Injectable()
export class CashFlowService {
    private readonly logger: Logger = new Logger(CashFlowService.name);

    constructor(
        private readonly bankAccountService: BankAccountsService,
        private readonly commonService: CommonService,
        private readonly expensesService: ExpensesService,
        private readonly incomeService: IncomeService,
        private readonly invoiceService: InvoiceService,
    ) {}

    public async findAllCashFlowDayByDate(
        date: Date | FindOperator<Date>,
        userId: number,
    ): Promise<CashFlowDayEntity[]> {
        return await this.commonService.confirmTransaction(
            async (entityManager) => {
                return await entityManager.find(CashFlowDayEntity, {
                    where: {
                        date,
                        userId,
                    },
                });
            },
        );
    }

    public async findCashFlowDayByDate({
        date,
        userId,
        order,
    }: {
        date: Date | FindOperator<Date>;
        userId: number;
        order?: FindOptionsOrder<CashFlowDayEntity>;
    }): Promise<CashFlowDayEntity | null> {
        return await this.commonService.confirmTransaction(
            async (entityManager) => {
                return await entityManager.findOne(CashFlowDayEntity, {
                    where: {
                        date,
                        userId,
                    },
                    order,
                });
            },
        );
    }

    public async getMonthCashFlow({
        monthYear,
        userId,
    }: {
        monthYear: string;
        userId: number;
    }): Promise<ICashFlowResponse> {
        try {
            const monthDate = dayjs(monthYear).toDate();
            const fromDate = formatDate(
                getFirstDayOfMonth(monthDate),
                'YYYY-MM-DD',
            );
            const toDate = formatDate(
                getLastDayOfMonth(monthDate),
                'YYYY-MM-DD',
            );

            const incomes = this.commonService.mapToTransaction({
                transactions: await this.incomeService.findByFilters({
                    fromDate,
                    toDate,
                    userId,
                }),
            });
            const expenses = this.commonService.mapToTransaction({
                transactions: await this.expensesService.findByFilters({
                    fromDate,
                    toDate,
                    userId,
                }),
            });
            const invoices = this.commonService.mapToTransaction({
                transactions: await this.invoiceService.findByMonth(
                    fromDate,
                    userId,
                ),
            });
            const transactions = [...incomes, ...expenses, ...invoices];

            const userBankAccounts =
                await this.bankAccountService.findByUserId(userId);
            const totalBankAccountsBalance = userBankAccounts.reduce(
                (total, account) => total + account.currentBalance,
                0,
            );

            let dailyCashFlow: TDailyCashFlow = {};
            const monthCalendarDates = getMonthCalendarDates(monthDate);

            for (const date of monthCalendarDates) {
                const dayCashFlow = await this.findCashFlowDayByDate({
                    date,
                    userId,
                });
                if (!dayCashFlow) {
                    continue;
                }

                const isDateGreaterThanOrEqualToToday =
                    isDateGreaterThanOrEqualTo({
                        date: dayjs(date),
                        otherDate: getToday(),
                    });

                const openingBalance = isDateGreaterThanOrEqualToToday
                    ? dayCashFlow.openingBalance + totalBankAccountsBalance
                    : dayCashFlow.openingBalance;
                const closingBalance = isDateGreaterThanOrEqualToToday
                    ? dayCashFlow.closingBalance + totalBankAccountsBalance
                    : dayCashFlow.closingBalance;

                const formattedDate = formatDate(date, 'YYYY-MM-DD');

                dailyCashFlow = {
                    ...dailyCashFlow,
                    [formattedDate]: {
                        transactions: transactions.filter(
                            ({ start }) => start === formattedDate,
                        ),
                        openingBalance,
                        closingBalance,
                    },
                };
            }

            return {
                dailyCashFlow: dailyCashFlow,
                currentAccountsBalance: totalBankAccountsBalance,
            };
        } catch (error) {
            this.logger.error('Error when getting the user Cash Flow: ', error);
            throw error;
        }
    }

    public async createCashFlowDay(
        userId: number,
        date: Date,
    ): Promise<CashFlowDayEntity> {
        const previousCashFlow = await this.findCashFlowDayByDate({
            date: LessThan(date),
            userId,
            order: {
                date: 'DESC',
            },
        });
        const nextCashFlow = await this.findCashFlowDayByDate({
            date: MoreThan(date),
            userId,
            order: {
                date: 'ASC',
            },
        });

        const previousBalance = previousCashFlow
            ? previousCashFlow.closingBalance
            : 0;
        const nextBalance = nextCashFlow
            ? nextCashFlow.openingBalance
            : previousBalance;

        return await this.commonService.confirmTransaction(
            async (entityManager) => {
                const newCashFlow = entityManager.create(CashFlowDayEntity, {
                    openingBalance: previousBalance,
                    closingBalance: nextBalance,
                    userId,
                    date,
                });

                return await entityManager.save(CashFlowDayEntity, newCashFlow);
            },
        );
    }

    public async updateFutureDaysBalanceFromDate({
        date,
        price,
        userId,
    }: {
        date: Date;
        price: number;
        userId: number;
    }): Promise<CashFlowDayEntity[]> {
        const cashFlowDays = await this.findAllCashFlowDayByDate(
            MoreThan(date),
            userId,
        );

        cashFlowDays.forEach((cashFlowDay) => {
            cashFlowDay.openingBalance += price;
            cashFlowDay.closingBalance += price;
        });

        return cashFlowDays;
    }

    public async updateCashFlowDayForTransactionType({
        cashFlow,
        transactionType,
        operation,
        price,
        originalPrice,
    }: {
        transactionType: TransactionType;
        price: number;
        originalPrice: number;
        cashFlow: CashFlowDayEntity;
        operation: OperationType;
    }): Promise<void> {
        const currentClosingBalance = cashFlow.closingBalance;
        const transformedPrice =
            this.commonService.transformPriceByTransactionAndOperationType({
                transactionType,
                operation,
                price,
                originalPrice,
            });

        cashFlow.closingBalance = currentClosingBalance + transformedPrice;
        const updatedFutureCashFlowDays =
            await this.updateFutureDaysBalanceFromDate({
                date: cashFlow.date,
                userId: cashFlow.userId,
                price: transformedPrice,
            });

        await this.commonService.confirmTransaction(async (entityManager) => {
            await entityManager.save(CashFlowDayEntity, [
                cashFlow,
                ...updatedFutureCashFlowDays,
            ]);
        });
    }

    public async updateCashFlowForTransaction({
        transaction,
        operation,
    }: {
        transaction: ITransactionMessage;
        operation: OperationType;
    }) {
        await this.commonService.confirmTransaction(async () => {
            const { userId, timestamp, price, originalPrice, transactionType } =
                transaction;

            const transactionDate = new Date(timestamp);

            let cashFlow = await this.findCashFlowDayByDate({
                date: transactionDate,
                userId,
            });

            if (!cashFlow) {
                cashFlow = await this.createCashFlowDay(
                    userId,
                    transactionDate,
                );
            }

            await this.updateCashFlowDayForTransactionType({
                cashFlow,
                transactionType,
                operation,
                price: Number(price),
                originalPrice: Number(originalPrice),
            });
        });
    }
}
