import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank.entity';
import { Repository } from 'typeorm';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CommonService } from 'src/common/common.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,
    private commonService: CommonService,
  ) {}

  public async findById(
    bankAccountId: number,
    userId: number,
  ): Promise<BankAccountEntity> {
    const bankAccount = await this.bankAccountRepository.findOneBy({
      id: bankAccountId,
    });
    this.commonService.checkEntityExistence(bankAccount, 'Conta bancária');

    if (bankAccount.userId !== userId) {
      throw new UnauthorizedException(
        'Esse cartão de crédito não pertece ao usuário logado.',
      );
    }

    return bankAccount;
  }

  public async findByUserId(userId: number): Promise<BankAccountEntity[]> {
    const bankAccount = await this.bankAccountRepository.findBy({ userId });
    this.commonService.checkEntityExistence(bankAccount, 'Conta bancária');

    return bankAccount;
  }

  public async create(
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountEntity> {
    const newBankAccount = this.bankAccountRepository.create({
      bank: createBankAccountDto.bank,
      currentBalance: createBankAccountDto.currentBalance,
      userId: createBankAccountDto.userId,
    });

    await this.commonService.saveEntity(
      this.bankAccountRepository,
      newBankAccount,
    );

    return newBankAccount;
  }

  public async update(
    updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccountEntity> {
    const bankAccount = await this.findById(
      updateBankAccountDto.bankAccountId,
      updateBankAccountDto.userId,
    );
    bankAccount.currentBalance = updateBankAccountDto.currentBalance;

    await this.commonService.saveEntity(
      this.bankAccountRepository,
      bankAccount,
    );

    return bankAccount;
  }
}
