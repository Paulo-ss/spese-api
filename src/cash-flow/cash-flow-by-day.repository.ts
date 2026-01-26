import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { CashFlowByDay } from './entities/cash-flow-by-day.entity';
import {
    InjectTransactionHost,
    TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial, FindOperator, FindOptionsOrder, MoreThan } from 'typeorm';

@Injectable()
export class CashFlowByDayRepository extends BaseRepository<CashFlowByDay> {
    constructor(
        @InjectTransactionHost('default')
        txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    ) {
        super(txHost, CashFlowByDay);
    }

    public async findOneByDate({
        date,
        userId,
        order,
    }: {
        date: Date | FindOperator<Date>;
        userId: number;
        order?: FindOptionsOrder<CashFlowByDay>;
    }): Promise<CashFlowByDay | null> {
        return await this.repository.findOne({
            where: {
                date,
                userId,
            },
            order,
        });
    }

    public async findAllAfterDate(
        date: Date,
        userId: number,
    ): Promise<CashFlowByDay[]> {
        return await this.repository.find({
            where: {
                date: MoreThan(date),
                userId,
            },
        });
    }

    public async upsert(
        cashFlow: DeepPartial<CashFlowByDay>,
    ): Promise<CashFlowByDay>;
    public async upsert(
        cashFlows: DeepPartial<CashFlowByDay>[],
    ): Promise<CashFlowByDay[]>;
    public async upsert(
        cashFlows: DeepPartial<CashFlowByDay> | DeepPartial<CashFlowByDay>[],
    ): Promise<CashFlowByDay | CashFlowByDay[]> {
        return await this.repository.save(
            this.repository.create(cashFlows as unknown),
        );
    }
}
