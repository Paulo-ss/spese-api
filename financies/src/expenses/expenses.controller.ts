import { Controller } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { MessagePattern } from '@nestjs/microservices';
import { ExpenseEntity } from './entities/expense.entity';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @MessagePattern({ cmd: 'expense-by-id' })
  public async getById(dto: FindByIdAndUserIdDto): Promise<ExpenseEntity> {
    return this.expensesService.findById(dto.id, dto.userId);
  }

  @MessagePattern({ cmd: 'expense-by-filters' })
  public async getByFilters(
    dto: FindExpensesFiltersDto,
  ): Promise<ExpenseEntity[]> {
    return this.expensesService.findByFilters(dto);
  }

  @MessagePattern({ cmd: 'create-expense' })
  public async create(
    expense: CreateExpenseDto,
  ): Promise<ExpenseEntity | IGenericMessageResponse> {
    return this.expensesService.create(expense);
  }

  @MessagePattern({ cmd: 'pay-expense' })
  public async pay(expenseId: number): Promise<IGenericMessageResponse> {
    return this.expensesService.payExpense(expenseId);
  }
}
