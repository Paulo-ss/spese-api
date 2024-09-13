import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindByIdAndUserIdDto } from 'src/dto/find-by-id-and-user-id.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { PersistWageDto } from './dto/persist-wage.dto';

@Injectable()
export class IncomeService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async getIncomeById(dto: FindByIdAndUserIdDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'income-by-id' }, dto),
    );

    return response;
  }

  public async createIncome(income: CreateIncomeDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-income' },
        { ...income, userId },
      ),
    );

    return response;
  }

  public async updateIncome(
    income: UpdateIncomeDto,
    userId: number,
    incomeId: number,
  ) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'update-income' },
        { ...income, userId, incomeId },
      ),
    );

    return response;
  }

  public async deleteIncome(dto: FindByIdAndUserIdDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'delete-income' }, dto),
    );

    return response;
  }

  public async getWageByUserId(userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'wage-by-user-id' }, userId),
    );

    return response;
  }

  public async createWage(wage: PersistWageDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'create-wage' }, { ...wage, userId }),
    );

    return response;
  }

  public async updateWage(wage: PersistWageDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'update-wage' }, { ...wage, userId }),
    );

    return response;
  }
}
