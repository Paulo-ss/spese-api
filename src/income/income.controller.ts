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
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { FilterIncomesDto } from './dto/filter-incomes.dto';

@UseGuards(IsAuthenticatedGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get(':id')
  public async getIncomeById(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.incomeService.findById(id, userId);
  }

  @Post('filter')
  public async getIncomesByFilters(
    @CurrentUser() userId: number,
    @Body() filters: FilterIncomesDto,
  ) {
    return await this.incomeService.findByFilters({ ...filters, userId });
  }

  @Post()
  public async createIncome(
    @Body() income: CreateIncomeDto,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.create(income, userId);
  }

  @Put(':id')
  public async updateIncome(
    @Body() income: UpdateIncomeDto,
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.incomeService.update(income, userId, id);
  }

  @Delete(':id')
  public async deleteIncome(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.delete(id, userId);
  }
}
