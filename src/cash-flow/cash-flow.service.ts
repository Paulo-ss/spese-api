import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowDayEntity } from './entities/cash-flow-daily.entity';
import { FindOperator, LessThan, MoreThan, Repository } from 'typeorm';
import getMonthCalendarDates from './utils/get-month-calendar-dates.utils';
import {
  ICashFlowResponse,
  TDailyCashFlow,
} from './interfaces/cash-flow.interface';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { ITransactionCreatedMessage } from 'src/async-worker/types/messages';
import { CommonService } from 'src/common/common.service';
import { TransactionType } from 'src/analytics/enums/transaction-type';

@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(CashFlowDayEntity)
    private readonly cashFlowDayRepository: Repository<CashFlowDayEntity>,
    private readonly bankAccountService: BankAccountsService,
    private readonly commonService: CommonService,
  ) {}

  public async findAllCashFlowDayByDate(
    date: Date | FindOperator<Date>,
    userId: number,
  ): Promise<CashFlowDayEntity[]> {
    const cashFlowDays = await this.cashFlowDayRepository.find({
      where: {
        date,
        userId,
      },
    });

    return cashFlowDays;
  }

  public async findCashFlowDayByDate(
    date: Date | FindOperator<Date>,
    userId: number,
  ): Promise<CashFlowDayEntity | null> {
    const cashFlow = await this.cashFlowDayRepository.findOne({
      where: {
        date,
        userId,
      },
    });

    return cashFlow;
  }

  public async getMonthCashFlow(
    date: string,
    userId: number,
  ): Promise<ICashFlowResponse> {
    const [month, year] = date.split('-').map(Number);
    const monthDate = new Date(year, month - 1);
    const monthCalendarDates = getMonthCalendarDates(monthDate);

    let formattedDailyCashFlow: TDailyCashFlow = {};

    for (const date of monthCalendarDates) {
      const dayCashFlow = await this.findCashFlowDayByDate(date, userId);

      formattedDailyCashFlow = {
        ...formattedDailyCashFlow,
        [date.toISOString()]: {
          transactions: [],
          openingBalance: dayCashFlow ? dayCashFlow.openingBalance : undefined,
          closingBalance: dayCashFlow ? dayCashFlow.closingBalance : undefined,
        },
      };
    }

    const monthCashFlow: ICashFlowResponse = {
      dailyCashFlow: formattedDailyCashFlow,
    };

    const userBankAccounts = await this.bankAccountService.findByUserId(userId);
    if (userBankAccounts && userBankAccounts.length > 0) {
      monthCashFlow.currentAccountsBalance = userBankAccounts.reduce(
        (total, account) => total + account.currentBalance,
        0,
      );
    }

    return monthCashFlow;
  }

  public async createCashFlowDaily(
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

    await this.commonService.saveEntity(
      this.cashFlowDayRepository,
      newCashFlow,
    );

    return newCashFlow;
  }

  public async updateFutureDaysBalanceFromDate(
    date: Date,
    userId: number,
    value: number,
  ): Promise<CashFlowDayEntity[]> {
    const cashFlowDays = await this.findAllCashFlowDayByDate(
      MoreThan(date),
      userId,
    );

    cashFlowDays.forEach(async (cashFlowDay) => {
      cashFlowDay.openingBalance += value;
      cashFlowDay.closingBalance += value;
    });

    return cashFlowDays;
  }

  public async updateCashFlowDailyForTransactionType(
    transactionType: TransactionType,
    value: number,
    cashFlow: CashFlowDayEntity,
  ) {
    const currentClosingBalance = Number(cashFlow.closingBalance);
    let updatedFutureCashFlowDays: CashFlowDayEntity[] = [];

    switch (transactionType) {
      case TransactionType.INCOME:
        cashFlow.closingBalance = currentClosingBalance + value;
        updatedFutureCashFlowDays = await this.updateFutureDaysBalanceFromDate(
          cashFlow.date,
          cashFlow.userId,
          value,
        );

        await this.commonService.startTransaction(async (entityManager) => {
          await entityManager.save(CashFlowDayEntity, cashFlow);
          await entityManager.save(
            CashFlowDayEntity,
            updatedFutureCashFlowDays,
          );
        });

        break;
      case TransactionType.INVOICE:
      case TransactionType.EXPENSE:
        cashFlow.closingBalance = currentClosingBalance - value;
        updatedFutureCashFlowDays = await this.updateFutureDaysBalanceFromDate(
          cashFlow.date,
          cashFlow.userId,
          this.commonService.getNegativeNumber(value),
        );

        await this.commonService.startTransaction(async (entityManager) => {
          await entityManager.save(CashFlowDayEntity, cashFlow);
          await entityManager.save(
            CashFlowDayEntity,
            updatedFutureCashFlowDays,
          );
        });

        break;
      default:
        throw new InternalServerErrorException(
          new Error('Unsupported transaction type for Cash Flow update.'),
        );
    }
  }

  public async updateCashFlowForTransaction(
    transaction: ITransactionCreatedMessage,
  ) {
    const { userId, timestamp, value, transactionType } = transaction;

    const transactionDate = new Date(timestamp);

    let cashFlow = await this.findCashFlowDayByDate(transactionDate, userId);

    if (!cashFlow) {
      cashFlow = await this.createCashFlowDaily(userId, transactionDate);
    }

    await this.updateCashFlowDailyForTransactionType(
      transactionType,
      Number(value),
      cashFlow,
    );
  }
}
