import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(IsAuthenticatedGuard)
@Controller('expense')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get(':id')
  public async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.findById(id, userId);
  }

  @Post('filter')
  public async getByFilters(
    @Body() dto: FindExpensesFiltersDto,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.findByFilters({ ...dto, userId });
  }

  @Post()
  public async create(
    @Body() expense: CreateExpenseDto,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.create(expense, userId);
  }

  @Put(':id')
  public async pay(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.payExpense(id);
  }

  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.expensesService.delete(id, userId);
  }
}
