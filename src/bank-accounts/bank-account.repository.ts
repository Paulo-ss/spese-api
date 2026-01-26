import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { BankAccount } from './entities/bank.entity';
import {
    InjectTransactionHost,
    TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class BankAccountRepository extends BaseRepository<BankAccount> {
    constructor(
        @InjectTransactionHost('default')
        txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    ) {
        super(txHost, BankAccount);
    }

    public async findById(bankAccountId: number): Promise<BankAccount> {
        return await this.repository.findOneBy({ id: bankAccountId });
    }

    public async findByUserId(userId: number): Promise<BankAccount[]> {
        return await this.repository.findBy({ userId });
    }

    public async upsert(
        bankAccount: DeepPartial<BankAccount>,
    ): Promise<BankAccount>;
    public async upsert(
        bankAccounts: DeepPartial<BankAccount>[],
    ): Promise<BankAccount[]>;
    public async upsert(
        bankAccounts: DeepPartial<BankAccount> | DeepPartial<BankAccount>[],
    ): Promise<BankAccount | BankAccount[]> {
        return await this.repository.save(
            this.repository.create(bankAccounts as unknown),
        );
    }

    public async delete(bankAccount: BankAccount): Promise<void> {
        await this.repository.remove(bankAccount);
    }
}
