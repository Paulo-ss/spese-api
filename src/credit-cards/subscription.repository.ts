import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Subscription } from './entities/subscription.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class SubscriptionRepository extends BaseRepository<Subscription> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, Subscription);
    }

    public async findById(id: number): Promise<Subscription> {
        return await this.repository.findOne({
            where: { id },
            relations: {
                creditCard: true,
                expenses: {
                    creditCard: false,
                    bankAccount: false,
                    subscription: false,
                    invoice: { creditCard: false, expenses: false },
                },
            },
        });
    }

    public async findByUser(userId: number): Promise<Subscription[]> {
        return await this.repository.find({
            where: { userId },
            relations: { creditCard: true },
        });
    }

    public async findByCreditCard(
        creditCardId: number,
    ): Promise<Subscription[]> {
        return await this.repository.find({
            where: { creditCard: { id: creditCardId } },
            relations: { creditCard: true },
        });
    }

    public async upsert(
        subscription: DeepPartial<Subscription>,
    ): Promise<Subscription> {
        return await this.repository.save(this.repository.create(subscription));
    }

    public async delete(subscription: Subscription): Promise<void> {
        await this.repository.remove(subscription);
    }
}
