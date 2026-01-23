import {
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from './entities/bank.entity';
import { Repository } from 'typeorm';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CommonService } from 'src/common/common.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { IncomeService } from 'src/income/income.service';
import { ITransactionMessage } from '../async-worker/types/messages';
import { OperationType } from '../common/interfaces/operation-type';

@Injectable()
export class BankAccountsService {
    constructor(
        @InjectRepository(BankAccount)
        private readonly bankAccountRepository: Repository<BankAccount>,
        private readonly commonService: CommonService,
        @Inject(forwardRef(() => IncomeService))
        private readonly incomeService: IncomeService,
    ) {}

    public async findById(
        bankAccountId: number,
        userId: number,
        checkEntityExistence = true,
    ): Promise<BankAccount> {
        const bankAccount = await this.bankAccountRepository.findOneBy({
            id: bankAccountId,
        });

        if (checkEntityExistence) {
            this.commonService.checkEntityExistence(
                bankAccount,
                'Conta bancária',
            );
        }

        if (bankAccount.userId !== userId) {
            throw new UnauthorizedException(
                'Esse cartão de crédito não pertece ao usuário logado.',
            );
        }

        return bankAccount;
    }

    public async findByUserId(userId: number): Promise<BankAccount[]> {
        const bankAccount = await this.bankAccountRepository.findBy({ userId });
        this.commonService.checkEntityExistence(bankAccount, 'Conta bancária');

        return bankAccount;
    }

    public async create(
        createBankAccountDto: CreateBankAccountDto,
        userId: number,
    ): Promise<BankAccount> {
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
        const accounts: BankAccount[] = [];

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
    ): Promise<BankAccount> {
        const bankAccount = await this.findById(id, userId);
        bankAccount.currentBalance = updateBankAccountDto.currentBalance;

        await this.commonService.saveEntity(
            this.bankAccountRepository,
            bankAccount,
        );

        return bankAccount;
    }

    public async updateCurrentBalanceForTransaction({
        transaction,
        operation,
    }: {
        transaction: ITransactionMessage;
        operation: OperationType;
    }) {
        return this.commonService.confirmTransaction(async (entityManager) => {
            const {
                userId,
                bankAccountId,
                price,
                originalPrice,
                transactionType,
            } = transaction;

            const bankAccount = await entityManager.findOne(BankAccount, {
                where: {
                    userId,
                    id: bankAccountId,
                },
            });

            if (bankAccount) {
                const transformedPrice =
                    this.commonService.transformPriceByTransactionAndOperationType(
                        {
                            price,
                            originalPrice,
                            operation,
                            transactionType,
                        },
                    );

                bankAccount.currentBalance += transformedPrice;

                await entityManager.save(BankAccount, bankAccount);
            }
        });
    }
}
