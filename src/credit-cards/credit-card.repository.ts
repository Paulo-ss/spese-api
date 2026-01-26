import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { CreditCard } from './entities/credit-card.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class CreditCardRepository extends BaseRepository<CreditCard> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, CreditCard);
    }

    public async findById(creditCardId: number): Promise<CreditCard> {
        return await this.repository.findOne({
            where: { id: creditCardId },
            relations: {
                invoices: {
                    expenses: false,
                    creditCard: false,
                },
                subscriptions: { expenses: false },
                bankAccount: { expenses: false },
            },
            order: {
                invoices: {
                    closingDate: 'asc',
                },
            },
        });
    }

    public async findByUserId(userId: number): Promise<CreditCard[]> {
        return await this.repository
            .createQueryBuilder('cc')
            .leftJoinAndSelect('cc.invoices', 'invoice')
            .leftJoinAndSelect('cc.subscriptions', 'subscriptions')
            .where('cc.user_id = :userId', { userId })
            .getMany();
    }

    public async findByUserIdWithInvoices(
        userId: number,
    ): Promise<CreditCard[]> {
        return await this.repository
            .createQueryBuilder('cc')
            .leftJoinAndSelect('cc.invoices', 'in')
            .andWhere('cc.user_id = :userId', { userId })
            .getMany();
    }

    public async upsert(
        creditCard: DeepPartial<CreditCard>,
    ): Promise<CreditCard>;
    public async upsert(
        creditCards: DeepPartial<CreditCard>[],
    ): Promise<CreditCard[]>;
    public async upsert(
        creditCards: DeepPartial<CreditCard> | DeepPartial<CreditCard>[],
    ): Promise<CreditCard | CreditCard[]> {
        return await this.repository.save(
            this.repository.create(creditCards as unknown),
        );
    }

    public async delete(creditCard: CreditCard): Promise<void> {
        await this.repository.remove(creditCard);
    }
}
