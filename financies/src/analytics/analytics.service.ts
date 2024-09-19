import { Injectable } from '@nestjs/common';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { IncomeService } from 'src/income/income.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly ExpensesService: ExpensesService,
    private readonly creditCardService: CreditCardsService,
  ) {}
}
