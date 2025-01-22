import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WageEntity } from './entities/wage.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PersistWageDto } from './dto/persist-wage.dto';
import { UsersService } from 'src/users/users.service';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { IncomeService } from './income.service';
import { WageBusinessDay } from './enums/wage-business-day.enum';
import { getPreviousBusinessDay } from 'src/credit-cards/utils/get-previous-business-day.util';
import { getNextBusinessDay } from 'src/credit-cards/utils/get-next-business-day.util';
import { CreateIncomeDto } from './dto/create-income.dto';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class WageService {
  constructor(
    @InjectRepository(WageEntity)
    private readonly wageRepository: Repository<WageEntity>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
    private readonly incomeService: IncomeService,
  ) {}

  private getWagePaymentDate(wage: WageEntity, date: Date): Date {
    const paymentDate = new Date(date);
    paymentDate.setDate(wage.paymmentDay);

    return wage.businessDay
      ? wage.businessDay === WageBusinessDay.BEFORE
        ? getPreviousBusinessDay(paymentDate)
        : getNextBusinessDay(paymentDate)
      : paymentDate;
  }

  public async findByPaymentDay(paymmentDay: number): Promise<WageEntity[]> {
    const wages = await this.wageRepository.findBy({ paymmentDay });

    return wages;
  }

  public async findById(
    id: number,
    userId: number,
    checkEntityExistence = true,
  ): Promise<WageEntity> {
    const wage = await this.wageRepository.findOneBy({ id, userId });

    if (checkEntityExistence) {
      this.commonService.checkEntityExistence(wage, 'Salário');
    }

    return wage;
  }

  public async findByUserId(
    userId: number,
    checkEntityExistence = true,
  ): Promise<WageEntity[]> {
    const wage = await this.wageRepository.findBy({ userId });

    if (checkEntityExistence) {
      this.commonService.checkEntityExistence(wage, 'Salário');
    }

    return wage;
  }

  public async create(
    wage: PersistWageDto,
    userId: number,
  ): Promise<WageEntity> {
    const newWage = this.wageRepository.create({ ...wage, userId });

    await this.commonService.saveEntity(this.wageRepository, newWage);
    await this.usersService.finishAccountSetup(userId);

    return newWage;
  }

  public async createMultiple(
    wages: PersistWageDto[],
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const today = new Date();
    const newWages: WageEntity[] = [];

    for (const wage of wages) {
      newWages.push(this.wageRepository.create({ ...wage, userId }));
    }

    await this.commonService.saveMultipleEntities(
      this.wageRepository,
      newWages,
    );
    await this.usersService.finishAccountSetup(userId);

    const incomes: CreateIncomeDto[] = [];

    for (const wage of newWages) {
      const paymentDate = this.getWagePaymentDate(wage, today);

      if (paymentDate === today) {
        incomes.push({
          incomeMonth: paymentDate
            .toLocaleDateString('en')
            .replaceAll('/', '-'),
          name: `wage ${paymentDate.toISOString()}`,
          value: wage.wage,
          bankAccountId: wage.bankAccount?.id,
          userId: wage.userId,
          wage: wage,
        });
      }
    }

    await this.incomeService.createMultiple(incomes);

    return this.commonService.generateGenericMessageResponse(
      'Salários cadastrados com sucesso',
    );
  }

  public async update(
    id: number,
    { wage, paymmentDay }: PersistWageDto,
    userId: number,
  ): Promise<WageEntity> {
    const wageToBeUpdated = await this.findById(id, userId);
    wageToBeUpdated.wage = wage;
    wageToBeUpdated.paymmentDay = paymmentDay;

    const updatedAge = await this.commonService.saveEntity(
      this.wageRepository,
      wageToBeUpdated,
    );

    return updatedAge;
  }

  public async generateWagesIncomes() {
    const today = new Date();
    const wages = await this.findByPaymentDay(today.getDate());

    const incomes: CreateIncomeDto[] = [];

    for (const wage of wages) {
      const paymentDate = this.getWagePaymentDate(wage, today);
      const formattedPaymentDate = paymentDate
        .toLocaleDateString('en')
        .replaceAll('/', '-');

      const doesIncomeAlreadyExistsForWagePaymentDate =
        await this.incomeService.findByFilters({
          fromDate: formattedPaymentDate,
          toDate: formattedPaymentDate,
          wageId: wage.id,
          userId: wage.userId,
        });

      if (
        isNotEmpty(doesIncomeAlreadyExistsForWagePaymentDate) &&
        doesIncomeAlreadyExistsForWagePaymentDate.length > 0
      ) {
        continue;
      }

      incomes.push({
        incomeMonth: formattedPaymentDate,
        name: `wage ${paymentDate.toISOString()}`,
        value: wage.wage,
        bankAccountId: wage.bankAccount?.id,
        userId: wage.userId,
        wage: wage,
      });
    }

    const createdIncomes = await this.incomeService.createMultiple(incomes);

    return createdIncomes;
  }
}
