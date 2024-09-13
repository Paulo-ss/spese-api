import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindByIdAndUserIdDto } from 'src/dto/find-by-id-and-user-id.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async findById(findByIdAndUserIdDto: FindByIdAndUserIdDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'bank-by-id' }, findByIdAndUserIdDto),
    );

    return response;
  }

  public async findByUserId(userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'bank-user-id' }, userId),
    );

    return response;
  }

  public async create(bankAccount: CreateBankAccountDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-bank-account' },
        { ...bankAccount, userId },
      ),
    );

    return response;
  }

  public async update(bankAccount: UpdateBankAccountDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'update-bank-account' },
        { ...bankAccount, userId },
      ),
    );

    return response;
  }
}
