import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowDayEntity } from './entities/cash-flow-daily.entity';
import { FindOperator, LessThan, MoreThan, Repository } from 'typeorm';
import {
  ICashFlowResponse,
  ITransaction,
  TDailyCashFlow,
} from './interfaces/cash-flow.interface';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { ITransactionCreatedMessage } from 'src/async-worker/types/messages';
import { CommonService } from 'src/common/common.service';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { getNegativeNumber } from 'src/common/utils/numbers.utils';
import { OperationType } from './interfaces/operation-type';
import { ExpensesService } from 'src/expenses/expenses.service';
import {
  formatInTimezone,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getMonthCalendarDates,
} from 'src/common/utils/dates.utils';
import { IncomeService } from 'src/income/income.service';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { InvoiceEntity } from 'src/credit-cards/entities/invoice.entity';
import { IncomeEntity } from 'src/income/entities/income.entity';
import { RequestContextService } from 'src/common/request-context.service';

@Injectable()
export class CashFlowService {
  private readonly logger: Logger = new Logger(CashFlowService.name);

  constructor(
    @InjectRepository(CashFlowDayEntity)
    private readonly cashFlowDayRepository: Repository<CashFlowDayEntity>,
    private readonly bankAccountService: BankAccountsService,
    private readonly commonService: CommonService,
    private readonly expensesService: ExpensesService,
    private readonly incomeService: IncomeService,
    private readonly invoiceService: InvoiceService,
    private readonly requestContext: RequestContextService,
  ) {}

  private mapIncomesToTransaction({
    incomes,
  }: {
    incomes: IncomeEntity[];
  }): ITransaction[] {
    const userTimezone = this.requestContext.getTimezone();

    return incomes.map((income) => ({
      entityId: income.id,
      type: TransactionType.INCOME,
      price: income.value,
      title: income.name,
      start: formatInTimezone(income.incomeMonth, userTimezone),
      end: formatInTimezone(income.incomeMonth, userTimezone),
    }));
  }

  private mapExpensesToTransaction({
    expenses,
  }: {
    expenses: ExpenseEntity[];
  }): ITransaction[] {
    const userTimezone = this.requestContext.getTimezone();

    return expenses.map((expense) => ({
      entityId: expense.id,
      type: TransactionType.EXPENSE,
      price: expense.price,
      title: expense.name,
      start: formatInTimezone(expense.expenseDate, userTimezone),
      end: formatInTimezone(expense.expenseDate, userTimezone),
    }));
  }

  private mapInvoicesToTransaction({
    invoices,
  }: {
    invoices: InvoiceEntity[];
  }): ITransaction[] {
    const userTimezone = this.requestContext.getTimezone();

    return invoices.map((invoice) => ({
      entityId: invoice.id,
      type: TransactionType.INVOICE,
      price: invoice.currentPrice,
      title: `Fatura ${invoice.dueDate} ${invoice.creditCard.lastFourDigits}`,
      start: formatInTimezone(invoice.dueDate, userTimezone),
      end: formatInTimezone(invoice.dueDate, userTimezone),
    }));
  }

  private transformPriceByTransactionAndOperationType({
    transactionType,
    operation,
    price,
    originalPrice,
  }: {
    transactionType: TransactionType;
    operation: OperationType;
    price: number;
    originalPrice?: number;
  }): number {
    const operationsMap = {
      [TransactionType.INCOME]: {
        [OperationType.INSERT]: price,
        [OperationType.UPDATE]: price - originalPrice,
        [OperationType.DELETE]: getNegativeNumber(price),
      },
      [TransactionType.EXPENSE]: {
        [OperationType.INSERT]: getNegativeNumber(price),
        [OperationType.UPDATE]: originalPrice - price,
        [OperationType.DELETE]: price,
      },
      [TransactionType.INVOICE]: {
        [OperationType.INSERT]: getNegativeNumber(price),
        [OperationType.UPDATE]: originalPrice - price,
        [OperationType.DELETE]: price,
      },
    };

    return operationsMap[transactionType][operation];
  }

  public async findAllCashFlowDayByDate(
    date: Date | FindOperator<Date>,
    userId: number,
  ): Promise<CashFlowDayEntity[]> {
    return await this.commonService.confirmTransaction(
      async (entityManager) => {
        const cashFlowDays = await entityManager.find(CashFlowDayEntity, {
          where: {
            date,
            userId,
          },
        });

        return cashFlowDays;
      },
    );
  }

  public async findCashFlowDayByDate(
    date: Date | FindOperator<Date>,
    userId: number,
  ): Promise<CashFlowDayEntity | null> {
    return await this.commonService.confirmTransaction(
      async (entityManager) => {
        const cashFlow = await entityManager.findOne(CashFlowDayEntity, {
          where: {
            date,
            userId,
          },
        });

        return cashFlow;
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
      const [month, year] = monthYear.split('-').map(Number);
      const monthDate = new Date(year, month - 1);

      const fromDate = `${month}-${getFirstDayOfMonth(monthDate).getDate()}-${year}`;
      const toDate = `${month}-${getLastDayOfMonth(monthDate).getDate()}-${year}`;

      const incomes = this.mapIncomesToTransaction({
        incomes: await this.incomeService.findByFilters({
          fromDate,
          toDate,
          userId,
        }),
      });
      const expenses = this.mapExpensesToTransaction({
        expenses: await this.expensesService.findByFilters({
          fromDate,
          toDate,
          userId,
        }),
      });
      const invoices = this.mapInvoicesToTransaction({
        invoices: await this.invoiceService.findByMonth(monthYear, userId),
      });

      const transactions = [...incomes, ...expenses, ...invoices];

      let dailyCashFlow: TDailyCashFlow = {};
      const monthCalendarDates = getMonthCalendarDates(monthDate);
      const userTimezone = this.requestContext.getTimezone();

      for (const date of monthCalendarDates) {
        const userTimezonedDate = formatInTimezone(date, userTimezone);
        const dayCashFlow = await this.findCashFlowDayByDate(date, userId);

        dailyCashFlow = {
          ...dailyCashFlow,
          [userTimezonedDate]: {
            transactions: transactions.filter(
              ({ start: transactionDate }) =>
                formatInTimezone(transactionDate, userTimezone) ===
                userTimezonedDate,
            ),
            openingBalance: dayCashFlow
              ? dayCashFlow.openingBalance
              : undefined,
            closingBalance: dayCashFlow
              ? dayCashFlow.closingBalance
              : undefined,
          },
        };
      }

      const monthCashFlow: ICashFlowResponse = {
        dailyCashFlow: dailyCashFlow,
      };

      const userBankAccounts =
        await this.bankAccountService.findByUserId(userId);
      if (userBankAccounts && userBankAccounts.length > 0) {
        monthCashFlow.currentAccountsBalance = userBankAccounts.reduce(
          (total, account) => total + account.currentBalance,
          0,
        );
      }

      return monthCashFlow;
    } catch (error) {
      this.logger.error('Error when getting the user Cash Flow: ', error);
      throw error;
    }
  }

  public async createCashFlowDay(
    userId: number,
    date: Date,
  ): Promise<CashFlowDayEntity> {
    const previousCashFlow = await this.findCashFlowDayByDate(
      LessThan(date),
      userId,
    );
    const nextCashFlow = await this.findCashFlowDayByDate(
      MoreThan(date),
      userId,
    );

    const previousBalance = previousCashFlow
      ? previousCashFlow.closingBalance
      : 0;
    const nextBalance = nextCashFlow
      ? nextCashFlow.openingBalance
      : previousBalance;

    const newCashFlow = this.cashFlowDayRepository.create({
      openingBalance: previousBalance,
      closingBalance: nextBalance,
      userId,
      date,
    });

    return await this.commonService.confirmTransaction(
      async (entityManager) => {
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

    cashFlowDays.forEach(async (cashFlowDay) => {
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
    const currentClosingBalance = Number(cashFlow.closingBalance);
    const transformedPrice = this.transformPriceByTransactionAndOperationType({
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
    transaction: ITransactionCreatedMessage;
    operation: OperationType;
  }) {
    await this.commonService.confirmTransaction(async () => {
      const { userId, timestamp, price, originalPrice, transactionType } =
        transaction;

      const transactionDate = new Date(timestamp);

      let cashFlow = await this.findCashFlowDayByDate(transactionDate, userId);

      if (!cashFlow) {
        cashFlow = await this.createCashFlowDay(userId, transactionDate);
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
