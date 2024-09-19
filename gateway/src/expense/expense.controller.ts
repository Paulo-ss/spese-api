import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get(':id')
  public async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.expenseService.getById({ id, userId });
  }

  @Post('filter')
  public async getByFilters(
    @Body() dto: FindExpensesFiltersDto,
    @CurrentUser() userId: number,
  ) {
    return this.expenseService.getByFilters(dto, userId);
  }

  @Post()
  public async create(
    @Body() expense: CreateExpenseDto,
    @CurrentUser() userId: number,
  ) {
    return this.expenseService.create(expense, userId);
  }

  @Put(':id')
  public async pay(@Param('id', ParseIntPipe) id: number) {
    return this.expenseService.pay(id);
  }
}
