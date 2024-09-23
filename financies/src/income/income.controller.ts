import {
  Controller,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { WageService } from './wage.service';
import { MessagePattern } from '@nestjs/microservices';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { IncomeEntity } from './entities/income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PersistWageDto } from './dto/persist-wage.dto';
import { WageEntity } from './entities/wage.entity';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';

@UsePipes(new ValidationPipe())
@UseFilters(new RcpExceptionFilter())
@Controller()
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly wageService: WageService,
  ) {}

  @MessagePattern({ cmd: 'income-by-id' })
  public async getIncomeById({
    id,
    userId,
  }: FindByIdAndUserIdDto): Promise<IncomeEntity> {
    return await this.incomeService.findById(id, userId);
  }

  @MessagePattern({ cmd: 'create-income' })
  public async createIncome(income: CreateIncomeDto): Promise<IncomeEntity> {
    return await this.incomeService.create(income);
  }

  @MessagePattern({ cmd: 'update-income' })
  public async updateIncome(income: UpdateIncomeDto): Promise<IncomeEntity> {
    return await this.incomeService.update(income);
  }

  @MessagePattern({ cmd: 'delete-income' })
  public async deleteIncome(
    dto: FindByIdAndUserIdDto,
  ): Promise<IGenericMessageResponse> {
    return this.incomeService.delete(dto.id, dto.userId);
  }

  @MessagePattern({ cmd: 'wage-by-user-id' })
  public async getWageByUserId(userId: number): Promise<WageEntity> {
    return this.wageService.findByUserId(userId);
  }

  @MessagePattern({ cmd: 'create-wage' })
  public async createWage(wage: PersistWageDto): Promise<WageEntity> {
    return await this.wageService.create(wage);
  }

  @MessagePattern({ cmd: 'update-wage' })
  public async updateWage(wage: PersistWageDto): Promise<WageEntity> {
    return await this.wageService.update(wage);
  }
}
