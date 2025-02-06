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
import { WageService } from './wage.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PersistWageDto } from './dto/persist-wage.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { FilterIncomesDto } from './dto/filter-incomes.dto';

@UseGuards(IsAuthenticatedGuard)
@Controller('income')
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly wageService: WageService,
  ) {}

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

  @Get('wage/:id')
  public async getWageById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.wageService.findById(id, userId);
  }

  @Get('wage/all/user')
  public async getWageByUserId(@CurrentUser() userId: number) {
    return this.wageService.findByUserId(userId);
  }

  @Post('wage')
  public async createWage(
    @Body() wage: PersistWageDto,
    @CurrentUser() userId: number,
  ) {
    return await this.wageService.create(wage, userId);
  }

  @Post('wage/multiple')
  public async createMultipleWages(
    @Body() wages: PersistWageDto[],
    @CurrentUser() userId: number,
  ) {
    return await this.wageService.createMultiple(wages, userId);
  }

  @Put('wage/:id')
  public async updateWage(
    @Param('id', ParseIntPipe) id: number,
    @Body() wage: PersistWageDto,
    @CurrentUser() userId: number,
  ) {
    return await this.wageService.update(id, wage, userId);
  }

  @Delete('wage/:id')
  public async deleteWage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.wageService.delete(id, userId);
  }
}
