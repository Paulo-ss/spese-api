import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomesRepository: Repository<IncomeEntity>,
    private readonly commonService: CommonService,
  ) {}

  public async findById(
    incomeId: number,
    userId: number,
  ): Promise<IncomeEntity> {
    const income = await this.incomesRepository.findOneBy({
      id: incomeId,
      userId,
    });
    this.commonService.checkEntityExistence(income, 'Renda');

    return income;
  }

  public async findMultipleByUserIdAndMonth(
    userId: number,
    incomeDate: string,
  ): Promise<IncomeEntity[]> {
    const [month, year] = incomeDate.split('-').map(Number);

    return await this.incomesRepository.findBy({
      userId,
      incomeMonth: new Date(year, month),
    });
  }

  public async create(createIncome: CreateIncomeDto): Promise<IncomeEntity> {
    const [month, day, year] = createIncome.incomeMonth.split('-').map(Number);

    const newIncome = this.incomesRepository.create({
      name: createIncome.name,
      value: createIncome.value,
      incomeMonth: new Date(year, month - 1, day),
      userId: createIncome.userId,
    });

    await this.commonService.saveEntity(this.incomesRepository, newIncome);

    return newIncome;
  }

  public async update({
    incomeId,
    name,
    value,
    incomeMonth,
    userId,
  }: UpdateIncomeDto): Promise<IncomeEntity> {
    const income = await this.findById(incomeId, userId);

    if (!isUndefined(name) && !isNull(name)) {
      income.name = name;
    }

    if (!isUndefined(value) && !isNull(value)) {
      income.value = value;
    }

    if (!isUndefined(incomeMonth) && !isNull(incomeMonth)) {
      const [month, day, year] = incomeMonth.split('-').map(Number);
      income.incomeMonth = new Date(year, month - 1, day);
    }

    const updatedIncome = await this.commonService.saveEntity(
      this.incomesRepository,
      income,
    );

    return updatedIncome;
  }

  public async delete(
    incomeId: number,
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const income = await this.findById(incomeId, userId);

    await this.commonService.removeEntity(this.incomesRepository, income);

    return this.commonService.generateGenericMessageResponse(
      'Renda deletada com sucesso.',
    );
  }
}
