import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowDailyEntity } from './entities/cash-flow-daily.entity';
import { Repository } from 'typeorm';
import getMonthCalendarDates from './utils/get-month-calendar-dates.utils';
import {
  ICashFlowResponse,
  TDailyCashFlow,
} from './interfaces/cash-flow.interface';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';

@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(CashFlowDailyEntity)
    private readonly dailyCashFlowRepository: Repository<CashFlowDailyEntity>,
    private readonly bankAccountService: BankAccountsService,
  ) {}

  public async findMonthDailyCashFlowByUserId(month: Date, userId: number) {
    const dailyCashFlow = await this.dailyCashFlowRepository.findOne({
      where: {
        date: month,
        userId,
      },
      relations: {
        events: true,
      },
    });

    return dailyCashFlow;
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
      const dayCashFlow = await this.findMonthDailyCashFlowByUserId(
        date,
        userId,
      );

      formattedDailyCashFlow = {
        ...formattedDailyCashFlow,
        [date.toISOString()]: {
          transactions: dayCashFlow ? dayCashFlow.events : undefined,
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
}
