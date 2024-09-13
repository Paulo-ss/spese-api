import { Controller } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { MessagePattern } from '@nestjs/microservices';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { BankAccountEntity } from './entities/bank.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Controller()
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @MessagePattern({ cmd: 'bank-by-id' })
  public async getBy({
    id,
    userId,
  }: FindByIdAndUserIdDto): Promise<BankAccountEntity> {
    return await this.bankAccountsService.findById(id, userId);
  }

  @MessagePattern({ cmd: 'bank-user-id' })
  public async getByUserId(userId: number): Promise<BankAccountEntity[]> {
    return await this.bankAccountsService.findByUserId(userId);
  }

  @MessagePattern({ cmd: 'create-bank-account' })
  public async create(
    banckAccount: CreateBankAccountDto,
  ): Promise<BankAccountEntity> {
    return await this.bankAccountsService.create(banckAccount);
  }

  @MessagePattern({ cmd: 'update-bank-account' })
  public async update(
    banckAccount: UpdateBankAccountDto,
  ): Promise<BankAccountEntity> {
    return await this.bankAccountsService.update(banckAccount);
  }
}
