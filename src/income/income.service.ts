import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { WageService } from './wage.service';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private readonly incomesRepository: Repository<IncomeEntity>,
    @Inject(forwardRef(() => WageService))
    private readonly wageService: WageService,
    private readonly commonService: CommonService,
    @Inject(forwardRef(() => BankAccountsService))
    private readonly bankAccountService: BankAccountsService,
  ) {}

  public async findById(
    incomeId: number,
    userId: number,
  ): Promise<IncomeEntity> {
    const income = await this.incomesRepository.findOne({
      where: {
        id: incomeId,
        userId,
      },
      relations: {
        bankAccount: { expenses: false },
        wage: { bankAccount: false },
      },
    });
    this.commonService.checkEntityExistence(income, 'Renda');

    return income;
  }

  public async findByFilters(
    filters: FilterIncomesDto,
  ): Promise<IncomeEntity[]> {
    const [month, day, year] = filters.fromDate.split('-').map(Number);
    const [toMonth, toDay, toYear] = filters.toDate.split('-').map(Number);

    const query = this.incomesRepository
      .createQueryBuilder('in')
      .where('in.income_month between :from and :to', {
        from: new Date(year, month - 1, day),
        to: new Date(toYear, toMonth - 1, toDay),
      });

    if (filters.userId) {
      query.andWhere('in.user_id = :userId', { userId: filters.userId });
    }

    if (filters.wageId) {
      query.andWhere('in.wageId = :wageId', { wageId: filters.wageId });
    }

    query.orderBy('in.income_month', 'DESC');

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
      .andWhere('in.wageId is null')
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
      bankAccount: createIncome.bankAccountId
        ? await this.bankAccountService.findById(
            createIncome.bankAccountId,
            userId,
            false,
          )
        : undefined,
      userId: userId,
      wage: createIncome.wage
        ? await this.wageService.findById(createIncome.wage.id, userId, false)
        : undefined,
    });

    await this.commonService.saveEntity(this.incomesRepository, newIncome);

    return newIncome;
  }

  public async createMultiple(
    incomes: CreateIncomeDto[],
  ): Promise<IGenericMessageResponse> {
    for (const income of incomes) {
      const [month, day, year] = income.incomeMonth.split('-').map(Number);

      const newIncome = this.incomesRepository.create({
        name: income.name,
        value: income.value,
        incomeMonth: new Date(year, month - 1, day),
        bankAccount: income.bankAccountId
          ? await this.bankAccountService.findById(
              income.bankAccountId,
              income.userId,
              false,
            )
          : undefined,
        userId: income.userId,
        wage: income.wage,
      });

      await this.commonService.saveEntity(this.incomesRepository, newIncome);
    }

    return this.commonService.generateGenericMessageResponse(
      'Rendas criadas com sucesso.',
    );
  }

  public async update(
    { name, value }: UpdateIncomeDto,
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
