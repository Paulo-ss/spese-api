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
import { PersistWageDto } from './dto/persist-wage.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get(':id')
  public async getIncomeById(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.incomeService.getIncomeById({ id, userId });
  }

  @Post()
  public async createIncome(
    @Body() income: CreateIncomeDto,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.createIncome(income, userId);
  }

  @Put(':id')
  public async updateIncome(
    @Body() income: UpdateIncomeDto,
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.incomeService.updateIncome(income, userId, id);
  }

  @Delete(':id')
  public async deleteIncome(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.deleteIncome({ id, userId });
  }

  @Get('wage/user')
  public async getWageByUserId(@CurrentUser() userId: number) {
    return this.incomeService.getWageByUserId(userId);
  }

  @Post('wage')
  public async createWage(
    @Body() wage: PersistWageDto,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.createWage(wage, userId);
  }

  @Put('wage/user')
  public async updateWage(
    @Body() wage: PersistWageDto,
    @CurrentUser() userId: number,
  ) {
    return await this.incomeService.updateWage(wage, userId);
  }
}
