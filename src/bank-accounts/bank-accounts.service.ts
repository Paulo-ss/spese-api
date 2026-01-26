import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BankAccount } from './entities/bank.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CommonService } from 'src/common/common.service';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ITransactionMessage } from '../async-worker/types/messages';
import { OperationType } from '../common/interfaces/operation-type';
import { BankAccountRepository } from './bank-account.repository';

@Injectable()
export class BankAccountsService {
    constructor(
        private readonly bankAccountRepository: BankAccountRepository,
        private readonly commonService: CommonService,
    ) {}

    public async findById(
        bankAccountId: number,
        userId: number,
        checkEntityExistence = true,
    ): Promise<BankAccount> {
        const bankAccount =
            await this.bankAccountRepository.findById(bankAccountId);

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
        const bankAccount =
            await this.bankAccountRepository.findByUserId(userId);
        this.commonService.checkEntityExistence(bankAccount, 'Conta bancária');

        return bankAccount;
    }

    public async create(
        createBankAccountDto: CreateBankAccountDto,
        userId: number,
    ): Promise<BankAccount> {
        return await this.bankAccountRepository.upsert({
            bank: createBankAccountDto.bank,
            currentBalance: createBankAccountDto.currentBalance,
            userId: userId,
        });
    }

    public async createMultiple(
        bankAccounts: CreateBankAccountDto[],
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const accounts = bankAccounts.map((bankAccount) => ({
            bank: bankAccount.bank,
            currentBalance: bankAccount.currentBalance,
            userId: userId,
        }));

        await this.bankAccountRepository.upsert(accounts);

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

        return await this.bankAccountRepository.upsert(bankAccount);
    }

    public async updateCurrentBalanceForTransaction({
        transaction,
        operation,
    }: {
        transaction: ITransactionMessage;
        operation: OperationType;
    }) {
        const { userId, bankAccountId, price, originalPrice, transactionType } =
            transaction;

        const bankAccount = await this.findById(bankAccountId, userId);

        if (bankAccount) {
            const transformedPrice =
                this.commonService.transformPriceByTransactionAndOperationType({
                    price,
                    originalPrice,
                    operation,
                    transactionType,
                });

            bankAccount.currentBalance += transformedPrice;

            await this.bankAccountRepository.upsert(bankAccount);
        }
    }
}
