import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { isEmpty } from 'class-validator';
import { FilterIncomesDto } from './dto/filter-incomes.dto';

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

  public async findByFilters(
    userId: number,
    filters: FilterIncomesDto,
  ): Promise<IncomeEntity[]> {
    const [month, day, year] = filters.fromDate.split('-').map(Number);
    const [toMonth, toDay, toYear] = filters.toDate.split('-').map(Number);

    const query = this.incomesRepository
      .createQueryBuilder('in')
      .where('in.income_month between :from and :to', {
        from: new Date(year, month - 1, day),
        to: new Date(toYear, toMonth - 1, toDay),
      })
      .andWhere('in.user_id = :userId', { userId })
      .orderBy('in.income_month', 'DESC');

    return query.getMany();
  }

  public async getUsersMonthTotalIncome(
    userId: number,
    incomeDate: string,
  ): Promise<number> {
    const [month, year] = incomeDate.split('-').map(Number);
    const firstDayOfTheMonth = new Date(year, month - 1)
      .toISOString()
      .split('T')[0];
    const lastDayOfTheMonth = new Date(year, month, 0)
      .toISOString()
      .split('T')[0];

    const incomes = await this.incomesRepository
      .createQueryBuilder('in')
      .where('in.income_month between :from and :to', {
        from: firstDayOfTheMonth,
        to: lastDayOfTheMonth,
      })
      .andWhere('in.user_id = :userId', { userId })
      .getMany();

    if (isNull(incomes) || isUndefined(incomes) || isEmpty(incomes)) {
      return 0;
    }

    return incomes.reduce((monthTotal, income) => {
      return monthTotal + Number(income.value);
    }, 0);
  }

  public async create(
    createIncome: CreateIncomeDto,
    userId: number,
  ): Promise<IncomeEntity> {
    const [month, day, year] = createIncome.incomeMonth.split('-').map(Number);

    const newIncome = this.incomesRepository.create({
      name: createIncome.name,
      value: createIncome.value,
      incomeMonth: new Date(year, month - 1, day),
      userId: userId,
    });

    await this.commonService.saveEntity(this.incomesRepository, newIncome);

    return newIncome;
  }

  public async update(
    { name, value, incomeMonth }: UpdateIncomeDto,
    userId: number,
    incomeId: number,
  ): Promise<IncomeEntity> {
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
