import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank.entity';
import { Repository } from 'typeorm';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CommonService } from 'src/common/common.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { IncomeService } from 'src/income/income.service';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,
    private readonly commonService: CommonService,
    @Inject(forwardRef(() => IncomeService))
    private readonly incomeService: IncomeService,
  ) {}

  public async findById(
    bankAccountId: number,
    userId: number,
    checkEntityExistence = true,
  ): Promise<BankAccountEntity> {
    const bankAccount = await this.bankAccountRepository.findOneBy({
      id: bankAccountId,
    });

    if (checkEntityExistence) {
      this.commonService.checkEntityExistence(bankAccount, 'Conta bancária');
    }

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
    userId: number,
  ): Promise<BankAccountEntity> {
    const newBankAccount = this.bankAccountRepository.create({
      bank: createBankAccountDto.bank,
      currentBalance: createBankAccountDto.currentBalance,
      userId: userId,
    });

    await this.commonService.saveEntity(
      this.bankAccountRepository,
      newBankAccount,
    );

    return newBankAccount;
  }

  public async createMultiple(
    bankAccounts: CreateBankAccountDto[],
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const accounts: BankAccountEntity[] = [];

    for (const bankAccount of bankAccounts) {
      accounts.push(
        this.bankAccountRepository.create({
          bank: bankAccount.bank,
          currentBalance: bankAccount.currentBalance,
          userId: userId,
        }),
      );
    }

    await this.commonService.saveMultipleEntities(
      this.bankAccountRepository,
      accounts,
    );

    return this.commonService.generateGenericMessageResponse(
      'Contas bancárias registradas com sucesso.',
    );
  }

  public async update(
    id: number,
    updateBankAccountDto: UpdateBankAccountDto,
    userId: number,
  ): Promise<BankAccountEntity> {
    const bankAccount = await this.findById(id, userId);
    bankAccount.currentBalance = updateBankAccountDto.currentBalance;

    await this.commonService.saveEntity(
      this.bankAccountRepository,
      bankAccount,
    );

    return bankAccount;
  }

  public async updateCurrentBalanceForIncomes() {
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en').replaceAll('/', '-');

    const todayIncomes = await this.incomeService.findByFilters({
      fromDate: formattedToday,
      toDate: formattedToday,
    });

    for (const income of todayIncomes) {
      if (income.bankAccount) {
        const bankAccount = await this.findById(
          income.bankAccount.id,
          income.userId,
          false,
        );

        bankAccount.currentBalance =
          Number(bankAccount.currentBalance) + Number(income.value);

        await this.commonService.saveEntity(
          this.bankAccountRepository,
          bankAccount,
        );
      }
    }
  }
}
