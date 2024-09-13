import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindByIdAndUserIdDto } from 'src/dto/find-by-id-and-user-id.dto';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async getById(dto: FindByIdAndUserIdDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'expense-by-id' }, dto),
    );

    return response;
  }

  public async getByFilters(dto: FindExpensesFiltersDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'expense-by-filters' }, dto),
    );

    return response;
  }

  public async create(expense: CreateExpenseDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-expense' },
        { ...expense, userId },
      ),
    );

    return response;
  }

  public async pay(expenseId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'pay-expense' }, expenseId),
    );

    return response;
  }
}
